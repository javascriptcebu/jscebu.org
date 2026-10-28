import { brand, type Asset, type FontToken } from '@jscebu/brand';

/** Split rule text on backticks so `code` spans can render as <code>. */
export const inline = (text: string) => text.split('`').map((part, i) => ({ part, code: i % 2 === 1 }));

/** The tokens.css variable that holds a font's stack. */
export function fontVar(f: FontToken): string {
  if (f.id === 'jetbrainsMono') return 'var(--jc-font-mono)';
  if (f.id === 'roboto') return 'var(--jc-font-wordmark)';
  const p = brand.personalities.find((x) => x.type.headline.font === f.id);
  if (!p) throw new Error(`No personality uses ${f.id}`);
  return `var(--jc-font-${p.id})`;
}

export function asset(id: string): Asset {
  const a = brand.assets.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown asset ${id}`);
  return a;
}

/** A standalone document for an example snippet, with brand URLs made same-origin so previews work before launch. */
export const exampleDoc = (html: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>html, body { margin: 0; }</style></head><body>${html.replaceAll(`${brand.site}/brand/`, '/brand/')}</body></html>`;
