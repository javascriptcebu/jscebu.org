import { describe, expect, it } from 'vitest';
import { contrastRatio, luminance } from '../src/contrast.ts';

describe('contrastRatio', () => {
  it('is 21:1 for white on black', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#0E0F11', '#FFDF00')).toBeCloseTo(contrastRatio('#FFDF00', '#0E0F11'), 10);
  });

  it('gives yellow on ink well over 14:1', () => {
    expect(contrastRatio('#FFDF00', '#0E0F11')).toBeGreaterThan(14);
  });

  it('shows why yellow is never text on paper', () => {
    expect(contrastRatio('#FFDF00', '#F4F1EA')).toBeLessThan(1.3);
  });
});

describe('luminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 10);
  });
});
