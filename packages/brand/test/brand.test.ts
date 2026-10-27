import { describe, expect, it } from 'vitest';
import { brand } from '../src/brand.ts';
import { contrastRatio } from '../src/contrast.ts';

describe('brand data', () => {
  it('passes WCAG AA for every text/background pair', () => {
    for (const p of brand.textPairs) {
      expect(contrastRatio(p.fg, p.bg), p.where).toBeGreaterThanOrEqual(p.large ? 3 : 4.5);
    }
  });

  it('never uses yellow as text on paper', () => {
    expect(brand.textPairs.some((p) => p.fg === '#FFDF00' && p.bg === '#F4F1EA')).toBe(false);
  });

  it('has exactly yellow, ink and paper as system colors', () => {
    expect(brand.colors.map((c) => c.hex)).toEqual(['#FFDF00', '#0E0F11', '#F4F1EA']);
  });

  it('has the 10 MUST rules with unique ids', () => {
    expect(brand.must).toHaveLength(10);
    expect(new Set(brand.must.map((r) => r.id)).size).toBe(10);
  });

  it('ranks the signatures cursor, sticker, bisaya, photos', () => {
    expect(brand.signatures.map((s) => s.id)).toEqual(['cursor', 'sticker', 'bisaya', 'photos']);
  });

  it('ships every Bisaya phrase as a draft', () => {
    expect(brand.voice.phrases.every((p) => p.status === 'draft')).toBe(true);
  });

  it('gives every personality six uppercase hex colors', () => {
    for (const p of brand.personalities) {
      for (const k of ['bg', 'text', 'muted', 'accent', 'accentText', 'cursor'] as const) {
        expect(p.colors[k], `${p.id}.${k}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });
});
