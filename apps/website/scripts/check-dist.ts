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
import { brand, lintHtml, findColorLiteral, type Brand } from '@jscebu/brand';
import { DOMParser, parseHTML } from 'linkedom';

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
    .map((u) => {
      if (!u.startsWith('http')) return u;
      try { const url = new URL(u); return url.origin === SITE ? url.pathname + url.search + url.hash : ''; }
      catch { return ''; }
    })
    .filter((u) => u.startsWith('/') && !u.startsWith('//'))
    .map((u) => u.replace(/[?#].*$/, ''));
  return [...new Set(paths)].filter((p) => !fileExists(p));
}

/** Resolve canonical public URLs to physical files, without accepting redirect hops. */
export function resolveBuiltPath(urlPath: string, fileExists: (path: string) => boolean): string | undefined {
  let path: string;
  try { path = decodeURIComponent(urlPath); } catch { return undefined; }
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#\0]/.test(path) || path.split('/').some((part) => part === '.' || part === '..')) return undefined;
  if (/\.html?$/i.test(path)) return undefined;
  const file = path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
  if (fileExists(file)) return file;
  if (!path.endsWith('/') && !path.split('/').pop()!.includes('.') && fileExists(`${file}.html`)) return `${file}.html`;
  return undefined;
}

export function findRedirectProblems(redirects: { from: string; to: string; status: number }[], readUrl: (path: string) => string | undefined): string[] {
  return redirects.flatMap(({ from, to }) => {
    const error = (reason: string) => [`_redirects sends ${from} to ${to}: ${reason}`];
    let url: URL;
    try { url = new URL(to, SITE); } catch { return error('invalid URL'); }
    if (url.origin !== SITE) return [];
    const html = readUrl(url.pathname);
    if (html === undefined) return error('destination was not built at a canonical URL');
    if (!url.hash) return [];
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return error('malformed fragment encoding'); }
    return parseHTML(html).document.getElementById(id) ? [] : error(`missing fragment #${id}`);
  });
}

export function findSitemapProblems(xml: string, fileExists: (path: string) => boolean): string[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const entries = [...doc.querySelectorAll('url > loc')];
  if (!entries.length) return ['sitemap.xml has no page URLs'];
  return entries.flatMap((el) => {
    const text = el.textContent?.trim() ?? '';
    try {
      const url = new URL(text);
      if (url.origin === SITE && !url.search && !url.hash && fileExists(url.pathname)) return [];
    } catch { /* Report invalid and noncanonical entries alike. */ }
    return [`sitemap.xml links to ${text}, which is not a canonical built URL on ${SITE}`];
  });
}

export function findTemplateLinkProblems(html: string): string[] {
  const { document } = parseHTML(html);
  return ['event-post', 'fb-cover'].flatMap((name) => {
    const path = `/brand/templates/${name}`;
    const link = document.querySelector(`#downloads a[href="${path}"]`);
    if (!link) return [`/brand/ downloads is missing ${path}`];
    return link.hasAttribute('download') ? [`/brand/ ${path} must open without a download attribute`] : [];
  });
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

const FONT_FAMILY = /font-family\s*:(?!\s*(?:var\(|(?:inherit|initial|unset)\b))\s*[^;}"]+/i;

export function findLiterals(srcFiles: { path: string; text: string }[]): string[] {
  return srcFiles.flatMap(({ path, text }) =>
    text.split('\n').flatMap((line, i) => {
      const hit = findColorLiteral(line) ?? line.match(FONT_FAMILY)?.[0];
      return hit ? [`${path}:${i + 1}: "${hit.trim()}" (use a --jc-* variable)`] : [];
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
  const resolve = (path: string) => resolveBuiltPath(path, (p) => existsSync(join(dist, p)) && statSync(join(dist, p)).isFile());
  const exists = (path: string) => resolve(path) !== undefined;
  const readUrl = (path: string) => {
    const file = resolve(path);
    return file === undefined ? undefined : read(file);
  };

  const required = [
    'index.html', 'projects/index.html', 'about/index.html', 'links/index.html', '404.html',
    'brand/index.html', 'brand.md', 'brand/tokens.css', 'llms.txt', 'sitemap.xml', 'robots.txt', '_redirects',
    'brand/logo/sticker.svg', 'brand/templates/event-post.html', 'brand/templates/fb-cover.html',
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
    ...findRedirectProblems(redirects, readUrl),
    ...findSitemapProblems(read('sitemap.xml'), exists),
    ...findTemplateLinkProblems(brandHtml),
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
