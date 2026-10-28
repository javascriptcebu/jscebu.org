/** Copy the brand package's logos, photos and templates into public/brand/ (gitignored). */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const brandPkg = fileURLToPath(new URL('../../../packages/brand/', import.meta.url));
const target = fileURLToPath(new URL('../public/brand/', import.meta.url));

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const [from, to] of [
  ['assets/logo', 'logo'],
  ['assets/photos', 'photos'],
  ['templates', 'templates'],
]) {
  cpSync(brandPkg + from, target + to, { recursive: true });
}
console.log(`sync-brand: copied logo, photos and templates to ${target}`);
