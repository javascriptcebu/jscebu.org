import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseRedirects } from '../scripts/check-dist.ts';

describe('parseRedirects', () => {
  it('skips comments and blank lines and defaults the status to 302', () => {
    expect(parseRedirects('# old pages\n\n/a /b\n/c https://x.example 301\n')).toEqual([
      { from: '/a', to: '/b', status: 302 },
      { from: '/c', to: 'https://x.example', status: 301 },
    ]);
  });
});

describe('public/_redirects', () => {
  it('sends every old jscebu.org URL where the v1 spec says (§5)', () => {
    const rules = parseRedirects(readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8'));
    expect(rules).toEqual([
      { from: '/mission-vision', to: '/about/', status: 301 },
      { from: '/members', to: '/about/#organizers', status: 301 },
      { from: '/iniatives', to: '/about/', status: 301 },
      { from: '/initiatives', to: '/about/', status: 301 },
      { from: '/official-links', to: '/links/', status: 301 },
      { from: '/community-projects', to: '/projects/', status: 301 },
      { from: '/events', to: '/#events', status: 302 },
      { from: '/promotional-materials', to: '/brand/', status: 301 },
      { from: '/annual-hacktoberfest', to: 'https://hacktoberfest.jscebu.org/', status: 301 },
      { from: '/volunteers-training-workshop', to: '/about/', status: 301 },
    ]);
  });
});
