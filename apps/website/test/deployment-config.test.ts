import { readFileSync } from 'node:fs';
import { parse, type ParseError } from 'jsonc-parser';
import { describe, expect, it } from 'vitest';
import { assertDeploymentScope } from '../scripts/deployment-scope.ts';

const configText = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const errors: ParseError[] = [];
const config = parse(configText, errors);

it('pins the real JSONC config to the www Custom Domain', () => {
  expect(errors).toEqual([]);
  expect(() => assertDeploymentScope(config)).not.toThrow();
});

describe('deployment guard rejects expanded DNS scope', () => {
  it.each([
    [{ pattern: 'jscebu.org', custom_domain: true }],
    [{ pattern: '*.jscebu.org/*', custom_domain: true }],
    [{ pattern: 'www.jscebu.org', custom_domain: false }],
    [...config.routes, { pattern: 'extra.jscebu.org', custom_domain: true }],
    [],
  ].map((routes) => [routes]))('rejects changed route array %j', (routes) => {
    expect(() => assertDeploymentScope({ ...config, routes })).toThrow();
  });
  it('rejects top-level singular route', () => {
    expect(() => assertDeploymentScope({ ...config, route: 'other.example/*' })).toThrow();
  });
  it.each(['route', 'routes'])('rejects %s in each override location, even empty', (key) => {
    for (const value of ['', [], undefined]) {
      expect(() => assertDeploymentScope({ ...config, env: { staging: { [key]: value } } })).toThrow();
      expect(() => assertDeploymentScope({ ...config, previews: { [key]: value } })).toThrow();
    }
  });
});

it('assigns both deployment configuration and ownership reviews to the approved owner', () => {
  const owners = readFileSync(new URL('../../../.github/CODEOWNERS', import.meta.url), 'utf8');
  expect(owners).toContain('/apps/website/wrangler.jsonc @dorelljames');
  expect(owners).toContain('/.github/CODEOWNERS @dorelljames');
});
