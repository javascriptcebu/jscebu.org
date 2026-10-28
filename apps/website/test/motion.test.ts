import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const site = readFileSync(new URL('../src/layouts/Site.astro', import.meta.url), 'utf8');

describe('scroll reveal', () => {
  it('only hides not-yet-revealed content on screens, so printing or saving as PDF shows everything', () => {
    const hide = site.indexOf('.motion [data-reveal] {');
    expect(hide).toBeGreaterThan(0);
    const media = site.slice(site.lastIndexOf('@media', hide), hide);
    expect(media).toMatch(/^@media screen and \(prefers-reduced-motion: no-preference\)/);
  });
});
