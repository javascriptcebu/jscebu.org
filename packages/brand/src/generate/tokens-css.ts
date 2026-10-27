import { terminalGrid, terminalLine } from '../brand.ts';
import type { Brand, FontId, PersonalityId } from '../types.ts';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Hairline color per personality: ink on the light ones, faint white on Terminal. */
const lines: Record<PersonalityId, string> = { poster: 'var(--jc-ink)', terminal: terminalLine, journal: 'var(--jc-ink)' };

const extras: Partial<Record<PersonalityId, string[]>> = {
  terminal: [
    'background-image: linear-gradient(var(--jc-grid) 1px, transparent 1px), linear-gradient(90deg, var(--jc-grid) 1px, transparent 1px);',
    'background-size: 24px 24px;',
  ],
};

const block = (selector: string, decls: string[]) => `${selector} {\n${decls.map((d) => `  ${d}`).join('\n')}\n}`;

/** The brand as CSS custom properties plus the signature classes (cursor, sticker, highlighter). */
export function tokensCss(b: Brand): string {
  const stack = (id: FontId) => {
    const f = b.fonts.find((x) => x.id === id);
    if (!f) throw new Error(`Unknown font ${id}`);
    return f.cssStack;
  };

  const root = block(':root', [
    ...b.colors.map((c) => `--jc-${c.id}: ${c.hex};`),
    ...b.personalities.map((p) => `--jc-font-${p.id}: ${stack(p.type.headline.font)};`),
    `--jc-font-mono: ${stack('jetbrainsMono')};`,
    `--jc-font-wordmark: ${stack('roboto')};`,
    `--jc-grid: ${terminalGrid};`,
  ]);

  const scopes = b.personalities.map((p) => {
    const font = (id: FontId) => (id === p.type.headline.font ? `var(--jc-font-${p.id})` : stack(id));
    return block(`.jc-${p.id}`, [
      ...Object.entries(p.colors).map(([k, v]) => `--jc-${kebab(k)}: ${v};`),
      `--jc-line: ${lines[p.id]};`,
      `--jc-font-headline: ${font(p.type.headline.font)};`,
      `--jc-font-body: ${font(p.type.body.font)};`,
      `--jc-weight-headline: ${p.type.headline.weight};`,
      `--jc-weight-body: ${p.type.body.weight};`,
      `--jc-weight-mono: ${p.type.mono.weight};`,
      `--jc-headline-case: ${p.type.headline.uppercase ? 'uppercase' : 'none'};`,
      'background-color: var(--jc-bg);',
      'color: var(--jc-text);',
      'font-family: var(--jc-font-body);',
      `font-weight: var(--jc-weight-body);`,
      ...(extras[p.id] ?? []),
    ]);
  });

  return [
    `/* JavaScript Cebu brand tokens v${b.version}. Generated from packages/brand; do not edit. Rules: ${b.site}/brand.md */`,
    root,
    ...scopes,
    block('.jc-headline', [
      'font-family: var(--jc-font-headline);',
      'font-weight: var(--jc-weight-headline);',
      'text-transform: var(--jc-headline-case);',
    ]),
    block('.jc-mono', ['font-family: var(--jc-font-mono);', 'font-weight: var(--jc-weight-mono, 400);']),
    block('.jc-label', [
      'font-family: var(--jc-font-mono);',
      'font-weight: var(--jc-weight-mono, 400);',
      'text-transform: uppercase;',
      'letter-spacing: .08em;',
      'color: var(--jc-muted);',
    ]),
    '/* The event line: WHEN · WHERE · JSCEBU.ORG, on every event graphic. */',
    block('.jc-event-line', [
      'font-family: var(--jc-font-mono);',
      'font-weight: 600;',
      'text-transform: uppercase;',
      'letter-spacing: .08em;',
    ]),
    '/* Real photos: mark them .jc-photo and never filter them. */',
    block('.jc-photo', ['display: block;', 'object-fit: cover;']),
    '/* The cursor: wrap the last word and the cursor in .jc-nw so the cursor never wraps alone. */',
    block('.jc-nw', ['white-space: nowrap;']),
    block('.jc-cursor', [
      'display: inline-block;',
      'width: .5em;',
      'height: .8em;',
      'margin-left: .08em;',
      'vertical-align: -.05em;',
      'background: var(--jc-cursor, currentColor);',
    ]),
    block('.jc-cursor--blink', ['animation: jc-blink 1.05s steps(1) infinite;']),
    '@keyframes jc-blink {\n  50% { opacity: 0; }\n}',
    '@media (prefers-reduced-motion: reduce) {\n  .jc-cursor--blink { animation: none; }\n}',
    '/* The sticker: use the sticker files, which already carry the white die-cut edge. */',
    block('.jc-sticker', ['display: inline-block;', 'transform: rotate(-8deg);']),
    block('.jc-sticker--shadow', ['filter: drop-shadow(0 .35em .5em rgba(0, 0, 0, .35));']),
    '/* The Journal highlighter: a yellow band behind the key phrase. */',
    block('.jc-highlight', [
      'color: var(--jc-ink);',
      'background: linear-gradient(transparent 40%, var(--jc-yellow) 40%);',
      'padding: 0 .08em;',
      '-webkit-box-decoration-break: clone;',
      'box-decoration-break: clone;',
    ]),
  ].join('\n\n') + '\n';
}
