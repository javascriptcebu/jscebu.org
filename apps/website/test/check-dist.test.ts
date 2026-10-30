import { describe, expect, it } from 'vitest';
import { brand } from '@jscebu/brand';
import { resolveBuiltPath, findRedirectProblems, findSitemapProblems, findTemplateLinkProblems, findCursorViolations, findLiterals, findMissingLinks, findParityGaps, isSourceText, parityRules } from '../scripts/check-dist.ts';

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

  it('checks every path on this site, so a link to a redirect source counts as missing', () => {
    expect(findMissingLinks('<a href="/events">x</a><a href="/about/#organizers">y</a>', (p) => p === '/about/')).toEqual(['/events']);
  });

  it('ignores other origins, mailto links and in-page anchors', () => {
    expect(findMissingLinks('<a href="https://fonts.googleapis.com/x">y</a><a href="mailto:hello@jscebu.org">m</a><a href="#join">j</a>', () => false)).toEqual([]);
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

describe('isSourceText', () => {
  it('scans source files for literals but not images', () => {
    expect(['a.astro', 'b.ts', 'c.css', 'd.mjs', 'e.md', 'f.json'].map(isSourceText)).toEqual([true, true, true, true, true, true]);
    expect(['g.jpg', 'h.png', 'i.webp', 'j.svg', 'k.woff2'].map(isSourceText)).toEqual([false, false, false, false, false]);
  });
});

describe('canonical built URLs', () => {
  const files = new Set(['index.html', 'about/index.html', 'brand/templates/event-post.html', 'brand/tokens.css']);
  it.each([
    ['/', 'index.html'], ['/about/', 'about/index.html'],
    ['/brand/templates/event-post', 'brand/templates/event-post.html'], ['/brand/tokens.css', 'brand/tokens.css'],
    ['/brand/templates/missing', undefined], ['/about', undefined], ['/about/index.html', undefined],
    ['/brand/templates/event-post.html', undefined], ['/%ZZ', undefined], ['/../index.html', undefined],
  ])('resolves %s without canonicalization hops', (path, expected) => {
    expect(resolveBuiltPath(path, (p) => files.has(p))).toBe(expected);
  });
});

describe('redirect destinations', () => {
  const read = (path: string) => path === '/about/' ? '<html><body><h2 id="organizers">Team</h2><h2 id="café">Café</h2></body></html>' : undefined;
  it.each(['/about/#organizers', '/about/#caf%C3%A9', 'https://www.jscebu.org/about/#organizers', 'https://elsewhere.example/#missing'])('accepts %s', (to) => {
    expect(findRedirectProblems([{ from: '/members', to, status: 301 }], read)).toEqual([]);
  });
  it.each(['/about/#missing', '/missing/#organizers', '/about/#%ZZ'])('reports source and bad destination %s', (to) => {
    const errors = findRedirectProblems([{ from: '/members', to, status: 301 }], read);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/members');
    expect(errors[0]).toContain(to);
  });
});

describe('sitemap destinations', () => {
  const exists = (path: string) => path === '/about/';
  const xml = (url: string) => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url></urlset>`;
  it('accepts a canonical same-site page', () => {
    expect(findSitemapProblems(xml('https://www.jscebu.org/about/'), exists)).toEqual([]);
  });
  it.each(['https://www.jscebu.org/missing/', 'https://www.jscebu.org/members', 'https://www.jscebu.org/about', 'https://elsewhere.example/about/'])('rejects %s', (url) => {
    expect(findSitemapProblems(xml(url), exists)).toHaveLength(1);
  });
});

describe('brand template navigation', () => {
  const html = (attr = '') => `<html><body><section id="downloads"><a href="/brand/templates/event-post" ${attr}>Post</a><a href="/brand/templates/fb-cover">Cover</a></section></body></html>`;
  it('accepts canonical template links without download', () => expect(findTemplateLinkProblems(html())).toEqual([]));
  it('rejects even an empty download attribute', () => expect(findTemplateLinkProblems(html('download=""'))).toHaveLength(1));
  it('requires both links in downloads', () => expect(findTemplateLinkProblems('<html></html>')).toHaveLength(2));
});
