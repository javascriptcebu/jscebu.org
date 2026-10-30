import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('declares the tokens charset and preserves wildcard brand CORS', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  expect(headers).toMatch(/^\/brand\/tokens\.css\n  Content-Type: text\/css; charset=utf-8$/m);
  expect(headers).toMatch(/^\/brand\/\*\n  Access-Control-Allow-Origin: \*$/m);
});
