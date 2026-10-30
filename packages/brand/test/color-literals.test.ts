import { expect, it } from 'vitest';
import { findColorLiteral } from '../src/index.ts';

it.each(['#fff', '#abcd', '#AABBCC', '#AABBCCDD', 'rgb(', 'rgba(', 'hsl(', 'hsla(', 'hwb(', 'lab(', 'lch(', 'oklab(', 'oklch('])('finds %s', (value) => {
  expect(findColorLiteral(`color: ${value}`)).toBe(value);
});
it.each(['var(--jc-yellow)', 'url(#add)', 'url("#fff")', "url('#abcd')", '#abcdefghi'])('allows %s', (value) => {
  expect(findColorLiteral(value)).toBeUndefined();
});
