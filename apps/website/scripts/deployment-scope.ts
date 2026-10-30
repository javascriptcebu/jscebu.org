import { deepStrictEqual } from 'node:assert/strict';

/** A testable guard against expanding the Custom Domain/DNS surface. */
export function assertDeploymentScope(config: unknown): void {
  if (!config || typeof config !== 'object' || !('routes' in config)) throw new Error('Missing routes');
  deepStrictEqual(config.routes, [{ pattern: 'www.jscebu.org', custom_domain: true }]);
  const visit = (value: unknown, path: string): void => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if ((key === 'route' || key === 'routes') && !(path === '' && key === 'routes')) {
        throw new Error(`Unexpected deployment override: ${path}${key}`);
      }
      visit(child, `${path}${key}.`);
    }
  };
  visit(config, '');
}
