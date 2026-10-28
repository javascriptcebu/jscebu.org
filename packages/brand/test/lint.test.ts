import { describe, expect, it } from 'vitest';
import { lintHtml } from '../src/lint.ts';

const tokens = '<link rel="stylesheet" href="/brand/tokens.css">';
const rules = (html: string) => lintHtml(html).map((i) => i.rule);

describe('lintHtml', () => {
  describe('noColorLiterals', () => {
    it.each([
      `<p style="color: #abc">x</p>`,
      `<p style="color: #AABBCC">x</p>`,
      `<style>p { color: rgb(1, 2, 3); }</style>`,
      `<style>p { color: hsl(10 20% 30%); }</style>`,
    ])('flags %s', (html) => {
      expect(rules(tokens + html)).toContain('noColorLiterals');
    });

    it('allows var() colors and id selectors that look like hex', () => {
      expect(rules(`${tokens}<style>#bad, #add { color: var(--jc-ink); }</style><p style="color: var(--jc-yellow)">x</p>`)).toEqual([]);
    });
  });

  describe('cursorAttached', () => {
    it('flags a cursor outside a .jc-nw wrapper', () => {
      expect(rules(`${tokens}<h1>Ship it <span class="jc-cursor"></span></h1>`)).toContain('cursorAttached');
    });

    it('flags a .jc-nw wrapper with no word before the cursor', () => {
      expect(rules(`${tokens}<h1>Ship <span class="jc-nw"> <span class="jc-cursor"></span></span></h1>`)).toContain('cursorAttached');
    });

    it('accepts the last word and the cursor wrapped together', () => {
      expect(rules(`${tokens}<h1>Ship <span class="jc-nw">it<span class="jc-cursor" aria-hidden="true"></span></span></h1>`)).toEqual([]);
    });
  });

  describe('photosUnfiltered', () => {
    it('flags an inline filter on a photo', () => {
      expect(rules(`${tokens}<img class="jc-photo" src="a.jpg" alt="" style="filter: grayscale(1)">`)).toContain('photosUnfiltered');
    });

    it('flags a filter on an ancestor set from a style rule', () => {
      expect(rules(`${tokens}<style>.duo { filter: sepia(1); }</style><div class="duo"><img class="jc-photo" src="a.jpg" alt=""></div>`)).toContain('photosUnfiltered');
    });

    it('accepts an untouched photo', () => {
      expect(rules(`${tokens}<style>.x { filter: none; }</style><div class="x"><img class="jc-photo" src="a.jpg" alt=""></div>`)).toEqual([]);
    });
  });

  describe('logoOnYellow', () => {
    it.each(['lockup-light.svg', 'lockup-dark.png', 'mark-color.svg'])('flags %s on a Poster (yellow) piece', (file) => {
      expect(rules(`${tokens}<div class="jc-poster"><img src="/brand/logo/${file}" alt=""></div>`)).toContain('logoOnYellow');
    });

    it.each(['sticker.svg', 'lockup-ink.svg'])('accepts %s on a Poster piece', (file) => {
      expect(rules(`${tokens}<div class="jc-poster"><img src="/brand/logo/${file}" alt=""></div>`)).toEqual([]);
    });
  });

  describe('usesTokens', () => {
    it('requires a tokens.css link', () => {
      expect(rules('<p>x</p>')).toEqual(['usesTokens']);
    });

    it('accepts an absolute tokens.css link', () => {
      expect(rules('<link rel="stylesheet" href="https://www.jscebu.org/brand/tokens.css"><p>x</p>')).toEqual([]);
    });
  });
});
