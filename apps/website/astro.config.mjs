// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.jscebu.org',
  output: 'static',
  // Astro 7 defaults to 'jsx' whitespace handling, which can drop the space
  // before the cursor's word wrapper. Plain collapsing keeps it.
  compressHTML: true,
});
