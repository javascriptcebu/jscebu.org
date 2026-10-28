/**
 * Build every logo variant from the traced mark (source/mark-paths.json) and
 * the Roboto wordmark: SVG masters plus PNG exports in assets/logo/.
 * Idempotent; run with `pnpm --filter @jscebu/brand build:logos`.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import opentype from 'opentype.js';
import { brand } from '../../src/brand.ts';

const root = new URL('../../', import.meta.url);
const out = new URL('assets/logo/', root);
const require = createRequire(import.meta.url);

type Grad = { x1: number; y1: number; x2: number; y2: number; stops: { offset: number; color: string }[] };
const mark: {
  viewBox: [number, number, number, number];
  paths: Record<'ring' | 'inner' | 'blue' | 'green' | 'red' | 'outer', string>;
  gradients: Record<'ring' | 'blue' | 'green' | 'red', Grad>;
} = JSON.parse(readFileSync(new URL('source/mark-paths.json', root), 'utf8'));

const [, , MARK_W, MARK_H] = mark.viewBox;
const hex = (id: 'yellow' | 'ink' | 'paper') => brand.colors.find((c) => c.id === id)!.hex;
const INK = hex('ink');
const WHITE = '#FFFFFF';

/** The sticker's white die-cut edge, as a share of the mark's width (brand rule). */
const STICKER_EDGE = 0.05 * MARK_W;
const STICKER_TILT = -8;

/**
 * Lockup geometry measured from the dark-pixel bounding boxes of
 * javascriptcebu/ai-jscebu public/js-horizontal.png (5045×1284), the 2025 lockup.
 */
const LOCKUP = {
  width: 5045,
  height: 1284,
  /** The mark fills the full height at x 0. */
  markHeight: 1284,
  lines: [
    { text: 'JAVASCRIPT', weight: 900, left: 1392, top: 312, width: 3653, height: 447 },
    { text: 'CEBU', weight: 900, left: 1400, top: 817, width: 803, height: 221 },
  ],
} as const;

// ---------------------------------------------------------------- mark

type Style = { kind: 'color'; prefix: string } | { kind: 'one'; color: string };

function markBody(style: Style): { defs: string; body: string } {
  const { paths: p } = mark;
  if (style.kind === 'one') {
    const fill = `fill="${style.color}"`;
    return {
      defs: '',
      body: [
        `<path d="${p.ring}" ${fill} fill-rule="evenodd"/>`,
        `<path d="${p.blue}" ${fill}/>`,
        `<path d="${p.green}" ${fill}/>`,
        `<path d="${p.red}" ${fill}/>`,
      ].join(''),
    };
  }
  const id = (k: string) => `${style.prefix}-${k}`;
  const defs = (Object.entries(mark.gradients) as [string, Grad][])
    .map(
      ([k, g]) =>
        `<linearGradient id="${id(k)}" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">` +
        g.stops.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('') +
        '</linearGradient>',
    )
    .join('');
  return {
    defs,
    body: [
      // The white stroke tucks under the ring so no background seam shows between them.
      `<path d="${p.inner}" fill="${WHITE}" stroke="${WHITE}" stroke-width="4" stroke-linejoin="round"/>`,
      `<path d="${p.ring}" fill="url(#${id('ring')})" fill-rule="evenodd"/>`,
      `<path d="${p.blue}" fill="url(#${id('blue')})"/>`,
      `<path d="${p.green}" fill="url(#${id('green')})"/>`,
      `<path d="${p.red}" fill="url(#${id('red')})"/>`,
    ].join(''),
  };
}

const svgDoc = (viewBox: number[], width: number, height: number, defs: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.map(round).join(' ')}" width="${round(width)}" height="${round(height)}">` +
  `<title>JavaScript Cebu</title>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>\n`;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function markSvg(style: Style): string {
  const { defs, body } = markBody(style);
  return svgDoc([0, 0, MARK_W, MARK_H], MARK_W, MARK_H, defs, body);
}

function stickerParts(prefix: string) {
  const { defs, body } = markBody({ kind: 'color', prefix });
  const edge = `<path d="${mark.paths.outer}" fill="${WHITE}" stroke="${WHITE}" stroke-width="${round(2 * STICKER_EDGE)}" stroke-linejoin="round"/>`;
  return { defs, body: edge + body, box: [-STICKER_EDGE, -STICKER_EDGE, MARK_W + 2 * STICKER_EDGE, MARK_H + 2 * STICKER_EDGE] };
}

function stickerSvg(): string {
  const { defs, body, box } = stickerParts('jcst');
  return svgDoc(box, box[2], box[3], defs, body);
}

function stickerTiltedSvg(): string {
  const { defs, body, box } = stickerParts('jcstt');
  const [x, y, w, h] = box;
  const rad = (Math.abs(STICKER_TILT) * Math.PI) / 180;
  const rw = w * Math.cos(rad) + h * Math.sin(rad);
  const rh = w * Math.sin(rad) + h * Math.cos(rad);
  const inner = `<g transform="rotate(${STICKER_TILT})"><g transform="translate(${round(-(x + w / 2))} ${round(-(y + h / 2))})">${body}</g></g>`;
  return svgDoc([-rw / 2, -rh / 2, rw, rh], rw, rh, defs, inner);
}

// ---------------------------------------------------------------- wordmark

const fonts = new Map<number, opentype.Font>();
function roboto(weight: number): opentype.Font {
  if (!fonts.has(weight)) {
    const file = require.resolve(`@fontsource/roboto/files/roboto-latin-${weight}-normal.woff`);
    const buf = readFileSync(file);
    fonts.set(weight, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return fonts.get(weight)!;
}

function layout(font: opentype.Font, text: string, size: number, tracking: number, x0 = 0, baseline = 0) {
  // charToGlyph skips GSUB, which opentype.js can't parse for Roboto; caps need no ligatures.
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const path = new opentype.Path();
  let x = x0;
  glyphs.forEach((g, i) => {
    path.extend(g.getPath(x, baseline, size));
    const next = glyphs[i + 1];
    if (next) x += ((g.advanceWidth ?? 0) + font.getKerningValue(g, next)) * (size / font.unitsPerEm) + tracking;
  });
  return path;
}

/** Fit a line's ink box to the measured box: size from the height, tracking from the width. */
function wordmarkLine(line: (typeof LOCKUP.lines)[number]): string {
  const font = roboto(line.weight);
  const probe = layout(font, line.text, 1000, 0).getBoundingBox();
  const size = (1000 * line.height) / (probe.y2 - probe.y1);
  const untracked = layout(font, line.text, size, 0).getBoundingBox();
  const tracking = (line.width - (untracked.x2 - untracked.x1)) / (line.text.length - 1);
  const placed = layout(font, line.text, size, tracking).getBoundingBox();
  return layout(font, line.text, size, tracking, line.left - placed.x1, line.top - placed.y1).toPathData(2);
}

function lockupSvg(markStyle: Style, textColor: string): string {
  const { defs, body } = markBody(markStyle);
  const scale = LOCKUP.markHeight / MARK_H;
  const words = LOCKUP.lines.map((l) => `<path d="${wordmarkLine(l)}" fill="${textColor}"/>`).join('');
  return svgDoc([0, 0, LOCKUP.width, LOCKUP.height], LOCKUP.width, LOCKUP.height, defs, `<g transform="scale(${round(scale * 1e4) / 1e4})">${body}</g>${words}`);
}

// ---------------------------------------------------------------- write

const files: Record<string, { svg: string; png: number }> = {
  'mark-color': { svg: markSvg({ kind: 'color', prefix: 'jcmc' }), png: 1024 },
  'mark-ink': { svg: markSvg({ kind: 'one', color: INK }), png: 1024 },
  'mark-white': { svg: markSvg({ kind: 'one', color: WHITE }), png: 1024 },
  sticker: { svg: stickerSvg(), png: 1024 },
  'lockup-light': { svg: lockupSvg({ kind: 'color', prefix: 'jcll' }, INK), png: 2048 },
  'lockup-dark': { svg: lockupSvg({ kind: 'color', prefix: 'jcld' }, WHITE), png: 2048 },
  'lockup-ink': { svg: lockupSvg({ kind: 'one', color: INK }, INK), png: 2048 },
  'lockup-white': { svg: lockupSvg({ kind: 'one', color: WHITE }, WHITE), png: 2048 },
};

const png = (svg: string, width: number) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

mkdirSync(out, { recursive: true });
for (const [name, f] of Object.entries(files)) {
  writeFileSync(new URL(`${name}.svg`, out), f.svg);
  writeFileSync(new URL(`${name}.png`, out), png(f.svg, f.png));
}
writeFileSync(new URL('sticker-tilted.png', out), png(stickerTiltedSvg(), 1024));
console.log(`Wrote ${Object.keys(files).length} SVGs and ${Object.keys(files).length + 1} PNGs to ${out.pathname}`);
