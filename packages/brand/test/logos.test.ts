import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brand } from '../src/brand.ts';
import { erode, iou, readPng, renderSvg, whiteMask, type Raster } from './helpers/raster.ts';

const source = new URL('../source/', import.meta.url);
const logos = new URL('../assets/logo/', import.meta.url);
const svg = (name: string) => readFileSync(new URL(`${name}.svg`, logos), 'utf8');
const mask = (id: string) => whiteMask(readPng(new URL(`regions/${id}.png`, source)));

const marks = ['mark-color', 'mark-ink', 'mark-white', 'sticker'];
const lockups = ['lockup-light', 'lockup-dark', 'lockup-ink', 'lockup-white'];

describe('logo files', () => {
  it.each([...marks, ...lockups])('ships %s as SVG and PNG at the right width', (name) => {
    expect(existsSync(new URL(`${name}.svg`, logos))).toBe(true);
    const png = readPng(new URL(`${name}.png`, logos));
    expect(png.width).toBe(name.startsWith('lockup') ? 2048 : 1024);
  });

  it('ships the tilted sticker PNG at 1024px', () => {
    expect(readPng(new URL('sticker-tilted.png', logos)).width).toBe(1024);
  });
});

describe('mark-color', () => {
  const rendered = renderSvg(svg('mark-color'));
  const flat = readPng(new URL('mark-flattened.png', source));

  it('renders at the source size', () => {
    expect([rendered.width, rendered.height]).toEqual([flat.width, flat.height]);
  });

  it.each(['ring', 'inner', 'blue', 'green', 'red'])('matches the PSD colors within the %s region', (id) => {
    const inside = erode(mask(id), flat.width, 2);
    const diff = [0, 0, 0];
    let n = 0;
    inside.forEach((on, i) => {
      if (!on) return;
      n++;
      for (let c = 0; c < 3; c++) diff[c] += Math.abs(rendered.data[i * 4 + c] - flat.data[i * 4 + c]);
    });
    for (const d of diff) expect(d / n).toBeLessThanOrEqual(16);
  });
});

describe('one-color marks', () => {
  it.each([
    ['mark-ink', '#0E0F11'],
    ['mark-white', '#FFFFFF'],
  ])('%s uses only %s, with no gradient', (name, color) => {
    const text = svg(name);
    expect(text).not.toContain('Gradient');
    const fills = [...text.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
    expect(fills.length).toBeGreaterThan(0);
    expect(new Set(fills)).toEqual(new Set([color]));
  });

  it('lets the background show through the white gaps of mark-ink', () => {
    const r = renderSvg(svg('mark-ink'));
    const [inner, blue, green, red] = ['inner', 'blue', 'green', 'red'].map(mask);
    const gaps = erode(inner.map((on, i) => on && !blue[i] && !green[i] && !red[i]), r.width, 2);
    const total = gaps.filter(Boolean).length;
    const clear = gaps.filter((on, i) => on && r.data[i * 4 + 3] < 8).length;
    expect(total).toBeGreaterThan(1000);
    expect(clear / total).toBeGreaterThanOrEqual(0.99);
  });
});

describe('sticker', () => {
  const text = svg('sticker');

  it('pads the viewBox by 5% of the mark width on each side', () => {
    const [x, y, w, h] = text.match(/viewBox="([^"]+)"/)![1].split(/\s+/).map(Number);
    const edge = 1005 * 0.05;
    expect(x).toBeCloseTo(-edge, 1);
    expect(y).toBeCloseTo(-edge, 1);
    expect(w).toBeCloseTo(1005 + 2 * edge, 1);
    expect(h).toBeCloseTo(1006 + 2 * edge, 1);
  });

  it('draws the white die-cut edge before the mark', () => {
    const firstPath = text.indexOf('<path');
    expect(text.slice(firstPath, text.indexOf('>', firstPath))).toMatch(/fill="#FFFFFF"[^>]*stroke="#FFFFFF"/);
    expect(text.indexOf('url(#')).toBeGreaterThan(firstPath);
  });
});

describe('lockup-light wordmark', () => {
  it('overlays the 2025 horizontal lockup with IoU >= 0.90', () => {
    const ref = readPng(new URL('js-horizontal.png', source));
    const ours = renderSvg(svg('lockup-light'), ref.width);
    expect([ours.width, ours.height]).toEqual([ref.width, ref.height]);
    const markRight = 1300; // the wordmark starts at x 1392 in the reference
    const dark = (r: Raster) =>
      Array.from({ length: r.width * r.height }, (_, i) => {
        if (i % r.width < markRight || r.data[i * 4 + 3] < 128) return false;
        const [R, G, B] = [r.data[i * 4], r.data[i * 4 + 1], r.data[i * 4 + 2]];
        return 0.299 * R + 0.587 * G + 0.114 * B < 60;
      });
    expect(iou(dark(ours), dark(ref))).toBeGreaterThanOrEqual(0.9);
  });
});

describe('logo assets in brand data', () => {
  const uses = (id: string) => brand.assets.filter((a) => a.id === id || a.id === `${id}-png`).map((a) => a.use);

  it.each(['lockup-ink', 'mark-ink'])('%s is listed for yellow and light backgrounds', (id) => {
    expect(uses(id)).toHaveLength(2);
    for (const use of uses(id)) expect(use).toMatch(/yellow/i);
    for (const use of uses(id)) expect(use).toMatch(/light/i);
  });

  it.each(['lockup-white', 'mark-white'])('%s is listed for dark backgrounds', (id) => {
    expect(uses(id)).toHaveLength(2);
    for (const use of uses(id)) expect(use).toMatch(/dark/i);
  });
});
