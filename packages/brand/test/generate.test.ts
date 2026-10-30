import { describe, expect, it } from 'vitest';
import { brand, brandMd, llmsTxt, tokensCss } from '../src/index.ts';

describe('tokensCss', () => {
  const css = tokensCss(brand);

  it('declares the system colors and font stacks', () => {
    expect(css).toContain('--jc-yellow: #FFDF00;');
    expect(css).toContain('--jc-font-mono:');
  });

  it('scopes each personality', () => {
    expect(css).toMatch(/\.jc-poster\s*{[^}]*--jc-bg:\s*#FFDF00/);
  });

  it('draws a block cursor that never wraps alone', () => {
    expect(css).toMatch(/\.jc-cursor\s*{[^}]*display:\s*inline-block/);
    expect(css).toMatch(/\.jc-nw\s*{[^}]*white-space:\s*nowrap/);
  });

  it('stops the cursor blinking under reduced motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{[^}]*\.jc-cursor[^}]*animation:\s*none/);
  });

  it('styles the event line, labels and photos', () => {
    expect(css).toMatch(/\.jc-event-line\s*{[^}]*font-family:\s*var\(--jc-font-mono\)/);
    expect(css).toMatch(/\.jc-label\s*{[^}]*text-transform:\s*uppercase/);
    expect(css).toMatch(/\.jc-photo\s*{[^}]*object-fit:\s*cover/);
  });

  it('tilts the sticker -8deg by default', () => {
    expect(css).toMatch(/\.jc-sticker\s*{[^}]*rotate\(-8deg\)/);
  });

  it('is deterministic', () => {
    expect(tokensCss(brand)).toBe(css);
  });
});

describe('brandMd', () => {
  const md = brandMd(brand);

  it('starts with the title and version', () => {
    expect(md.startsWith('# JavaScript Cebu brand · v0.1.1')).toBe(true);
  });

  it('lists every MUST rule as a checkbox', () => {
    for (const r of brand.must) expect(md).toContain(`- [ ] ${r.text}`);
  });

  it('gives every asset as an absolute URL', () => {
    for (const a of brand.assets) expect(md).toContain(`https://www.jscebu.org${a.path}`);
    expect(md).toContain('https://www.jscebu.org/brand/tokens.css');
  });

  it('has a recipe heading per personality', () => {
    for (const p of brand.personalities) expect(md).toContain(`### ${p.id}`);
  });

  it('includes every logo rule', () => {
    for (const r of brand.logoRules) expect(md).toContain(r);
  });

  it('labels draft phrases as not yet approved', () => {
    expect(md).toMatch(/draft.*Dorell/i);
  });

  it('keeps the sections in the fixed order', () => {
    const order = ['## MUST', '## Logo', '## Colors', '## Fonts', '## Personalities', '## Signatures', '## Voice', '## Assets', '## Changelog'];
    const at = order.map((h) => md.indexOf(`\n${h}`));
    expect(at.every((i) => i > 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});

describe('links to the /brand page', () => {
  it('use the trailing slash the site serves it at, so agents skip a redirect', () => {
    for (const text of [brandMd(brand), llmsTxt(brand)]) {
      expect(text).toContain('https://www.jscebu.org/brand/');
      expect(text).not.toMatch(/https:\/\/www\.jscebu\.org\/brand(?![/.])/);
    }
  });
});

describe('llmsTxt', () => {
  it('points agents to brand.md', () => {
    const txt = llmsTxt(brand);
    expect(txt.startsWith('# JavaScript Cebu\n')).toBe(true);
    expect(txt).toContain('https://www.jscebu.org/brand.md');
  });
});

it('publishes canonical template URLs and a matching patch changelog', () => {
  const md = brandMd(brand);
  for (const name of ['event-post', 'fb-cover']) {
    expect(md).toContain(`https://www.jscebu.org/brand/templates/${name}`);
    expect(md).not.toContain(`/brand/templates/${name}.html`);
  }
  expect(brand.version).toBe('0.1.1');
  expect(brand.changelog[0].version).toBe(brand.version);
});
