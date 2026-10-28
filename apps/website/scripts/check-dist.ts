/**
 * Post-build checks over dist/ and src/. Run after `astro build`; exits 1 with a list on any failure.
 * - The cursor never wraps alone (and HTML compression didn't eat the space before its word).
 * - Every link to this site, on every page and in brand.md and llms.txt, resolves to a built file.
 * - Every redirect in _redirects that points at this site lands on a built file.
 * - Every rule appears on both the page and brand.md ("one source, two readers").
 * - No color or font-family literals in src/: everything comes from --jc-* variables.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, lintHtml, type Brand } from '@jscebu/brand';
import { parseHTML } from 'linkedom';

const SITE = 'https://www.jscebu.org';

export function findCursorViolations(html: string): string[] {
  const out = lintHtml(html)
    .filter((i) => i.rule === 'cursorAttached')
    .map((i) => i.message);
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  for (const wrap of document.querySelectorAll('.jc-nw')) {
    const prev = wrap.previousSibling;
    if (prev?.nodeType === 3 && /\S$/.test(prev.textContent ?? '')) {
      out.push(`No space before "${wrap.textContent}": the last word is glued to "${prev.textContent!.trim().split(/\s+/).pop()}".`);
    }
  }
  return out;
}

export function findMissingLinks(text: string, fileExists: (path: string) => boolean): string[] {
  const { document } = parseHTML(`<!doctype html><html><body>${text}</body></html>`);
  const urls = [
    ...[...document.querySelectorAll('[href], [src]')].map((el) => el.getAttribute('href') ?? el.getAttribute('src') ?? ''),
    ...[...text.matchAll(/https:\/\/www\.jscebu\.org\/[^\s"'<>)\]|`]*/g)].map((m) => m[0].replace(/[.,;:]+$/, '')),
  ];
  const paths = urls
    .map((u) => (u.startsWith(SITE) ? u.slice(SITE.length) || '/' : u))
    .filter((u) => u.startsWith('/') && !u.startsWith('//'))
    .map((u) => u.replace(/[?#].*$/, ''));
  return [...new Set(paths)].filter((p) => !fileExists(p));
}

const normalize = (s: string) => s.replaceAll('`', '').replace(/\s+/g, ' ').trim();

export function findParityGaps(pageText: string, md: string, rules: string[]): string[] {
  const page = normalize(pageText);
  const doc = normalize(md);
  return rules.flatMap((rule) => {
    const r = normalize(rule);
    return [
      ...(page.includes(r) ? [] : [`Missing from the /brand page: ${r}`]),
      ...(doc.includes(r) ? [] : [`Missing from brand.md: ${r}`]),
    ];
  });
}

const HEX = /(?<!url\(\s*['"]?)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
const FONT_FAMILY = /font-family\s*:(?!\s*(?:var\(|(?:inherit|initial|unset)\b))\s*[^;}"]+/i;

export function findLiterals(srcFiles: { path: string; text: string }[]): string[] {
  return srcFiles.flatMap(({ path, text }) =>
    text.split('\n').flatMap((line, i) => {
      const hit = line.match(HEX) ?? line.match(COLOR_FN) ?? line.match(FONT_FAMILY);
      return hit ? [`${path}:${i + 1}: "${hit[0].trim()}" (use a --jc-* variable)`] : [];
    }),
  );
}

/** Files whose text is code or content; images and fonts are skipped by the literal check. */
export const isSourceText = (path: string) => /\.(astro|ts|tsx|js|mjs|css|md|mdx|json)$/i.test(path);

/** Every rule list that must read the same on the page and in brand.md. */
export function parityRules(b: Brand): string[] {
  return [
    ...b.must.map((r) => r.text),
    ...b.logoRules,
    ...b.signatures.flatMap((s) => s.rules),
    ...b.personalities.flatMap((p) => [...p.recipe, ...p.dont]),
    ...b.voice.principles,
  ];
}

/** Parse a Cloudflare `_redirects` file: `source destination [status]`, status defaulting to 302. */
export function parseRedirects(text: string): { from: string; to: string; status: number }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status: status ? Number(status) : 302 };
    });
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function main(): void {
  const app = fileURLToPath(new URL('..', import.meta.url));
  const dist = join(app, 'dist');
  const read = (p: string) => readFileSync(join(dist, p), 'utf8');
  /** A URL path is built when it names a file, or ends in / over a folder with index.html. A bare folder path would cost a redirect. */
  const exists = (urlPath: string) => {
    const p = join(dist, decodeURIComponent(urlPath));
    if (urlPath.endsWith('/')) return existsSync(join(p, 'index.html'));
    return existsSync(p) && statSync(p).isFile();
  };

  const required = [
    'index.html', 'projects/index.html', 'about/index.html', 'links/index.html', '404.html',
    'brand/index.html', 'brand.md', 'brand/tokens.css', 'llms.txt', 'sitemap.xml', 'robots.txt', '_redirects',
    'brand/logo/sticker.svg', 'brand/templates/event-post.html',
  ];
  const pages = walk(dist).filter((p) => p.endsWith('.html') && !p.startsWith(join(dist, 'brand', 'templates'))).map((p) => relative(dist, p));
  const brandHtml = read('brand/index.html');
  const md = read('brand.md');
  const redirects = existsSync(join(dist, '_redirects')) ? parseRedirects(read('_redirects')) : [];
  const src = walk(join(app, 'src'))
    .filter(isSourceText)
    .map((p) => ({ path: relative(app, p), text: readFileSync(p, 'utf8') }));

  const errors = [
    ...required.filter((f) => !existsSync(join(dist, f))).map((f) => `dist/${f} was not built`),
    ...pages.flatMap((page) => {
      const html = read(page);
      return [
        ...findCursorViolations(html).map((m) => `${page} cursor: ${m}`),
        ...findMissingLinks(html, exists).map((p) => `${page} links to ${p}, which was not built`),
      ];
    }),
    ...findMissingLinks(md, exists).map((p) => `brand.md links to ${p}, which was not built`),
    ...findMissingLinks(read('llms.txt'), exists).map((p) => `llms.txt links to ${p}, which was not built`),
    ...redirects
      .filter((r) => r.to.startsWith('/') && !exists(r.to.replace(/#.*$/, '')))
      .map((r) => `_redirects sends ${r.from} to ${r.to}, which was not built`),
    ...findParityGaps(parseHTML(brandHtml).document.body.textContent ?? '', md, parityRules(brand)),
    ...findLiterals(src),
  ];

  if (errors.length) {
    console.error(`check-dist: ${errors.length} problem(s)\n${errors.map((e) => `  - ${e}`).join('\n')}`);
    process.exit(1);
  }
  console.log(
    `check-dist: ok (${required.length} files, ${pages.length} pages: cursor and links; ${redirects.length} redirects; /brand parity; ${src.length} source files free of literals)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
