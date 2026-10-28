import { describe, expect, it } from 'vitest';
import { brand } from '@jscebu/brand';
import { findCursorViolations, findLiterals, findMissingLinks, findParityGaps, parityRules } from '../scripts/check-dist.ts';

const cursor = '<span class="jc-cursor" aria-hidden="true"></span>';

describe('findCursorViolations', () => {
  it('accepts the last word wrapped with the cursor', () => {
    expect(findCursorViolations(`<h1>How JS Cebu <span class="jc-nw">looks${cursor}</span></h1>`)).toEqual([]);
  });

  it('flags a bare cursor', () => {
    expect(findCursorViolations(`<h1>How JS Cebu looks ${cursor}</h1>`)).toHaveLength(1);
  });

  it('flags a wrapper glued to the previous word (whitespace eaten by HTML compression)', () => {
    expect(findCursorViolations(`<h1>How JS Cebu<span class="jc-nw">looks${cursor}</span></h1>`)).toHaveLength(1);
  });
});

describe('findMissingLinks', () => {
  const exists = (path: string) => path !== '/brand/logo/missing.svg';

  it('reports a missing /brand asset, root-relative or absolute', () => {
    expect(findMissingLinks('<img src="/brand/logo/missing.svg">', exists)).toEqual(['/brand/logo/missing.svg']);
    expect(findMissingLinks('See https://www.jscebu.org/brand/logo/missing.svg.', exists)).toEqual(['/brand/logo/missing.svg']);
  });

  it('ignores pages the legacy site still serves and other origins', () => {
    expect(findMissingLinks('<a href="/events">x</a><a href="https://fonts.googleapis.com/x">y</a>', () => false)).toEqual([]);
  });
});

describe('findParityGaps', () => {
  const rules = ['JS Cebu yellow `#FFDF00` appears.', 'No hexagon shapes besides the logo.'];

  it('passes when every rule is in both the page and brand.md', () => {
    expect(findParityGaps('JS Cebu yellow #FFDF00 appears. No hexagon shapes besides the logo.', `- [ ] ${rules[0]}\n- [ ] ${rules[1]}`, rules)).toEqual([]);
  });

  it('reports a rule missing from either side', () => {
    const gaps = findParityGaps('JS Cebu yellow #FFDF00 appears.', `- [ ] ${rules[1]}`, rules);
    expect(gaps).toHaveLength(2);
    expect(gaps.join('\n')).toMatch(/page.*hexagon/i);
    expect(gaps.join('\n')).toMatch(/brand\.md.*yellow/i);
  });
});

describe('findLiterals', () => {
  it('flags hex colors and font families in source', () => {
    const found = findLiterals([{ path: 'src/a.astro', text: '<style>\n  p { color: #fff; }\n  h1 { font-family: Inter, sans-serif; }\n</style>' }]);
    expect(found).toHaveLength(2);
    expect(found[0]).toMatch(/^src\/a\.astro:2:/);
  });

  it('allows the brand variables', () => {
    expect(findLiterals([{ path: 'src/b.astro', text: 'p { color: var(--jc-yellow); font-family: var(--jc-font-mono); }' }])).toEqual([]);
  });
});

describe('parityRules', () => {
  it('covers every rule list the page and brand.md both show', () => {
    const rules = parityRules(brand);
    const expected = [
      ...brand.must.map((r) => r.text),
      ...brand.logoRules,
      ...brand.signatures.flatMap((s) => s.rules),
      ...brand.personalities.flatMap((p) => [...p.recipe, ...p.dont]),
      ...brand.voice.principles,
    ];
    expect(rules).toEqual(expect.arrayContaining(expected));
    expect(rules).toHaveLength(expected.length);
  });
});
