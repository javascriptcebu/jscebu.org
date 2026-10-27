import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';

export interface Raster { width: number; height: number; data: Uint8Array | Buffer }

export function renderSvg(svg: string, width?: number): Raster {
  const img = new Resvg(svg, width ? { fitTo: { mode: 'width', value: width } } : {}).render();
  return { width: img.width, height: img.height, data: img.pixels };
}

export function readPng(path: string | URL): Raster {
  const png = PNG.sync.read(readFileSync(path));
  return { width: png.width, height: png.height, data: png.data };
}

/** Intersection over union of two same-size boolean masks. */
export function iou(a: boolean[], b: boolean[]): number {
  if (a.length !== b.length) throw new Error(`Size mismatch: ${a.length} vs ${b.length}`);
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) inter++;
    if (a[i] || b[i]) union++;
  }
  return union === 0 ? 1 : inter / union;
}

export const alphaMask = (r: Raster, min = 128) => Array.from({ length: r.width * r.height }, (_, i) => r.data[i * 4 + 3] >= min);
export const whiteMask = (r: Raster, min = 128) => Array.from({ length: r.width * r.height }, (_, i) => r.data[i * 4] >= min);
