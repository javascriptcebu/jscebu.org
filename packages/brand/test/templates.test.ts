import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { brand } from '../src/brand.ts';
import { lintHtml } from '../src/lint.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('templates', () => {
  it.each(['templates/event-post.html', 'templates/fb-cover.html'])('%s passes lint', (path) => {
    expect(lintHtml(read(path))).toEqual([]);
  });

  it('gives the event post a mono event line ending in jscebu.org', () => {
    const { document } = parseHTML(read('templates/event-post.html'));
    expect(document.querySelector('.jc-event-line')?.textContent).toMatch(/·.*·.*JSCEBU\.ORG/i);
  });

  it.each(['templates/event-post.html', 'templates/fb-cover.html'])('%s links the brand assets by their /brand/ paths', (path) => {
    const html = read(path);
    expect(html).toContain('href="/brand/tokens.css"');
    expect(html).toMatch(/src="\/brand\/logo\/[a-z-]+\.(svg|png)"/);
  });

  it('puts the real photo on the Facebook cover', () => {
    expect(read('templates/fb-cover.html')).toContain('src="/brand/photos/community-meetup.jpg"');
  });
});

describe('personality examples', () => {
  it.each(brand.personalities.map((p) => [p.id, p] as const))('%s example passes lint', (_, p) => {
    expect(p.exampleHtml).not.toBe('');
    expect(lintHtml(p.exampleHtml)).toEqual([]);
    expect(p.exampleHtml).toContain(`class="jc-${p.id}`);
  });
});
