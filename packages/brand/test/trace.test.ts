import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { alphaMask, iou, readPng, renderSvg, whiteMask } from './helpers/raster.ts';

const source = new URL('../source/', import.meta.url);
const pathsFile = new URL('mark-paths.json', source);
const regions = ['ring', 'inner', 'blue', 'green', 'red', 'outer'] as const;

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const near = (hex: string, target: string, tol: number) =>
  channels(hex).every((v, i) => Math.abs(v - channels(target)[i]) <= tol);

describe('traced logo mark', () => {
  it('has a mark-paths.json', () => {
    expect(existsSync(pathsFile)).toBe(true);
  });

  const mark = existsSync(pathsFile) ? JSON.parse(readFileSync(pathsFile, 'utf8')) : null;

  it.each(regions)('traces %s with IoU >= 0.97 against its mask', (id) => {
    const [, , w, h] = mark.viewBox;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${mark.paths[id]}" fill="#000" fill-rule="evenodd"/></svg>`;
    const rendered = alphaMask(renderSvg(svg));
    const expected = whiteMask(readPng(new URL(`regions/${id}.png`, source)));
    expect(iou(rendered, expected)).toBeGreaterThanOrEqual(0.97);
  });

  it('runs the ring gradient from orange #FF8F00 to yellow #FFDF00', () => {
    const stops = mark.gradients.ring.stops;
    expect(near(stops[0].color, '#FF8F00', 6), stops[0].color).toBe(true);
    expect(near(stops.at(-1).color, '#FFDF00', 6), stops.at(-1).color).toBe(true);
  });
});
