import type { Brand } from '../types.ts';

/** The site's /llms.txt (llmstxt.org shape), pointing agents at the brand rules. */
export function llmsTxt(b: Brand): string {
  return `# ${b.name}

> ${b.name} is the JavaScript developer community in Cebu, Philippines: meetups, workshops and community projects. Its brand rules are published for people and for AI agents.

## Brand

- [Brand rules for agents](${b.site}/brand.md): the MUST checklist, exact tokens, a recipe per personality, voice and asset URLs. Read this before making anything for ${b.name}.
- [Brand guidelines](${b.site}/brand/): the same rules for people, with logo downloads.
- [tokens.css](${b.site}/brand/tokens.css): CSS custom properties and the cursor, sticker and highlighter classes.
`;
}
