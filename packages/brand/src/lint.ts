import { parseHTML } from 'linkedom';
import { findColorLiteral } from './color-literals.ts';

export type LintRule = 'noColorLiterals' | 'cursorAttached' | 'photosUnfiltered' | 'logoOnYellow' | 'usesTokens';
export interface LintIssue { rule: LintRule; message: string }

const FILTER = /(?:^|[;{\s])filter\s*:(?!\s*none\b)\s*[^;}]+/i;
const FULL_COLOR_LOGO = /(?:^|\/)(lockup-light|lockup-dark|mark-color)\.(?:svg|png)\b/;

/** Rough CSS rule splitter: good enough for flat rules and rules nested one level in @media. */
function cssRules(css: string): { selector: string; body: string }[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));
}

function matchesAny(el: Element, selector: string): boolean {
  return selector.split(',').some((s) => {
    try {
      return el.matches(s.trim());
    } catch {
      return false;
    }
  });
}

/** Check HTML against the machine-checkable MUST rules. An empty list means it passes. */
export function lintHtml(html: string): LintIssue[] {
  const { document } = parseHTML(/<html[\s>]/i.test(html) ? html : `<!doctype html><html><body>${html}</body></html>`);
  const issues: LintIssue[] = [];
  const styles = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '');
  // Scan declaration values, preserving ID selectors and url(#id) references.
  const declarations = [
    ...styles.flatMap(cssRules).map((r) => r.body),
    ...[...document.querySelectorAll('[style]')].map((el) => el.getAttribute('style') ?? ''),
  ];

  for (const text of declarations) {
    const hit = findColorLiteral(text);
    if (hit) {
      issues.push({ rule: 'noColorLiterals', message: `Color literal "${hit}". Use the --jc-* variables from tokens.css.` });
    }
  }

  for (const cursor of document.querySelectorAll('.jc-cursor')) {
    const wrap = cursor.parentElement;
    let before = '';
    for (const node of wrap?.childNodes ?? []) {
      if (node === cursor) break;
      before += node.textContent ?? '';
    }
    if (!wrap?.classList.contains('jc-nw') || !/\S/.test(before)) {
      issues.push({
        rule: 'cursorAttached',
        message: 'Wrap the last word and the cursor together: <span class="jc-nw">word<span class="jc-cursor" aria-hidden="true"></span></span>.',
      });
    }
  }

  const filterRules = styles.flatMap(cssRules).filter((r) => FILTER.test(r.body));
  for (const photo of document.querySelectorAll('img.jc-photo')) {
    for (let el: Element | null = photo; el && el.tagName !== 'BODY'; el = el.parentElement) {
      const filtered = FILTER.test(el.getAttribute('style') ?? '') || filterRules.some((r) => matchesAny(el!, r.selector));
      if (filtered) {
        issues.push({ rule: 'photosUnfiltered', message: `Photo ${photo.getAttribute('src')} is filtered. Photos stay real and unfiltered.` });
        break;
      }
    }
  }

  for (const img of document.querySelectorAll('.jc-poster img[src]')) {
    const file = img.getAttribute('src')!.match(FULL_COLOR_LOGO);
    if (file) {
      issues.push({ rule: 'logoOnYellow', message: `${file[1]} on yellow. Use the sticker or the ink one-color logo (lockup-ink, mark-ink).` });
    }
  }

  if (!document.querySelector('link[href*="tokens.css"]')) {
    issues.push({ rule: 'usesTokens', message: 'Link the brand tokens: <link rel="stylesheet" href="https://www.jscebu.org/brand/tokens.css">.' });
  }

  return issues;
}
