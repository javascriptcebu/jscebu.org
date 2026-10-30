import { existsSync, readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { linkSchema, organizerSchema, pageSchema, projectSchema } from '../src/content/schemas.ts';

const content = new URL('../src/content/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, content), 'utf8');
const frontmatter = (md: string) => parse(md.match(/^---\n([\s\S]*?)\n---/)![1]);

describe('site content', () => {
  it('lists the four organizers from /members, in order', () => {
    const organizers = z.array(organizerSchema({ image: () => z.string() })).parse(JSON.parse(read('organizers.json')));
    expect(organizers.map((o) => [o.name, o.role])).toEqual([
      ['Cyrus Hiyas', 'Lead'],
      ['Dorell James', 'Lead'],
      ['Harlequin Doyon', 'Lead'],
      ['Sieg Balona', 'Co-Lead'],
    ]);
  });

  it('links each organizer to their own site', () => {
    const organizers = z.array(organizerSchema({ image: () => z.string() })).parse(JSON.parse(read('organizers.json')));
    expect(Object.fromEntries(organizers.map((o) => [o.name, o.url]))).toEqual({
      'Cyrus Hiyas': 'https://www.sleepnotfound.com/',
      'Dorell James': 'https://www.dorelljames.com',
      'Harlequin Doyon': 'https://harlekoy.dev/',
      'Sieg Balona': 'https://siegb.dev/',
    });
  });

  it('gives each organizer a photo that exists in the repo', () => {
    const organizers = z.array(organizerSchema({ image: () => z.string() })).parse(JSON.parse(read('organizers.json')));
    for (const o of organizers) expect(existsSync(new URL(o.photo!, new URL('organizers.json', content))), o.name).toBe(true);
  });

  it('lists the official channels from /official-links', () => {
    const links = z.array(linkSchema).parse(JSON.parse(read('links.json')));
    expect(links.map((l) => l.url)).toEqual([
      'https://www.facebook.com/JavaScriptCebu/',
      'https://twitter.com/javascriptcebu',
      'https://github.com/javascriptcebu/',
      'mailto:hello@jscebu.org',
    ]);
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
