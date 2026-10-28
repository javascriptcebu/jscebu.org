import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { linkSchema, organizerSchema, pageSchema, projectSchema } from '../src/content/schemas.ts';

const content = new URL('../src/content/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, content), 'utf8');
const frontmatter = (md: string) => parse(md.match(/^---\n([\s\S]*?)\n---/)![1]);

describe('site content', () => {
  it('lists the four organizers from /members, in order', () => {
    const organizers = z.array(organizerSchema).parse(JSON.parse(read('organizers.json')));
    expect(organizers.map((o) => [o.name, o.role])).toEqual([
      ['Cyrus Hiyas', 'Lead'],
      ['Dorell James', 'Lead'],
      ['Harlequin Doyon', 'Lead'],
      ['Sieg Balona', 'Co-Lead'],
    ]);
  });

  it('lists the official channels from /official-links', () => {
    const links = z.array(linkSchema).parse(JSON.parse(read('links.json')));
    expect(links.map((l) => l.url)).toEqual(
      expect.arrayContaining([
        'https://www.facebook.com/JavaScriptCebu/',
        'https://twitter.com/javascriptcebu',
        'https://github.com/javascriptcebu/',
        'mailto:hello@jscebu.org',
      ]),
    );
  });

  it('features Cebby as the only project', () => {
    const cebby = projectSchema({ image: () => z.string() }).parse(frontmatter(read('projects/cebby.md')));
    expect(cebby).toMatchObject({ name: 'Cebby', url: 'https://www.getcebby.com', featured: true, status: 'active' });
  });

  it('keeps the mission verbatim on the about page', () => {
    const about = read('pages/about.md');
    pageSchema.parse(frontmatter(about));
    expect(about).toContain('JavaScript Cebu aims to empower and unite developers');
  });
});
