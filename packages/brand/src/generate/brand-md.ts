import { contrastRatio } from '../contrast.ts';
import type { Brand, FontRef, Hex } from '../types.ts';

const cell = (s: string) => s.replaceAll('|', '\\|');
const row = (cells: string[]) => `| ${cells.map(cell).join(' | ')} |`;
const table = (head: string[], rows: string[][]) =>
  [row(head), `|${head.map(() => '---').join('|')}|`, ...rows.map(row)].join('\n');
const bullets = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

/** The brand rules as one Markdown file for agents. Section order is fixed. */
export function brandMd(b: Brand): string {
  const url = (path: string) => `${b.site}${path}`;
  const font = (ref: FontRef) => {
    const f = b.fonts.find((x) => x.id === ref.font);
    if (!f) throw new Error(`Unknown font ${ref.font}`);
    return `${f.family} ${ref.weight}${ref.uppercase ? ', uppercase' : ''}`;
  };
  const named = (hex: Hex) => {
    const c = b.colors.find((x) => x.hex === hex);
    return c ? `\`${hex}\` (${c.id})` : `\`${hex}\``;
  };
  const hex = (id: 'yellow' | 'ink' | 'paper') => b.colors.find((c) => c.id === id)!.hex;
  const families = b.fonts
    .filter((f) => f.id !== 'roboto')
    .map((f) => `family=${new URL(f.googleFontsUrl).searchParams.get('family')!.replaceAll(' ', '+')}`);
  const allFonts = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;

  const sections: string[] = [];

  sections.push(`# ${b.name} brand · v${b.version}

> Rules for anyone, person or AI agent, making something for ${b.name}: event graphics, slides, pages, recaps. Follow the MUST checklist exactly and check your work against it before sharing. The same rules, with pictures, are at ${url('/brand/')}.

Start here:

${bullets([
  `Link the tokens: \`<link rel="stylesheet" href="${url('/brand/tokens.css')}">\``,
  `Load the fonts: \`<link rel="stylesheet" href="${allFonts}">\``,
  'Pick one personality (Poster, Terminal or Journal) and follow its recipe below. Put its class (`jc-poster`, `jc-terminal` or `jc-journal`) on the root element.',
  'Use the logo files linked below. Never redraw the logo.',
])}`);

  sections.push(`## MUST: check every piece

${b.must.map((r) => `- [ ] ${r.text}`).join('\n')}`);

  const logos = b.assets.filter((a) => a.path.startsWith('/brand/logo/'));
  sections.push(`## Logo

${bullets(b.logoRules)}

${table(['Version', 'Use', 'URL'], logos.map((a) => [a.label, a.use, url(a.path)]))}`);

  sections.push(`## Colors

${table(['Token', 'Hex', 'CSS variable', 'Role'], b.colors.map((c) => [c.id, `\`${c.hex}\``, `\`--jc-${c.id}\``, c.role]))}

Every text/background pair below passes WCAG AA. Yellow is never a text color on paper (${contrastRatio(hex('yellow'), hex('paper')).toFixed(1)}:1).

${table(['Text', 'Background', 'Where', 'Contrast'], b.textPairs.map((p) => [`\`${p.fg}\``, `\`${p.bg}\``, p.where, `${contrastRatio(p.fg, p.bg).toFixed(1)}:1`]))}`);

  sections.push(`## Fonts

Use only these. All are free (SIL Open Font License or Apache 2.0). One link loads them all: ${allFonts}

${table(['Font', 'Weights', 'Role', 'Google Fonts'], b.fonts.map((f) => [f.family, f.weights.join(', '), f.role, f.googleFontsUrl]))}`);

  sections.push(`## Personalities

Pick one per piece. Never mix them. The signatures and yellow tie them together.

${b.personalities
  .map((p) => {
    const c = p.colors;
    const parts = [
      `### ${p.id}`,
      `**${p.name}.** ${p.use} Put \`class="jc-${p.id}"\` on the root element.`,
      bullets([
        `Colors: background ${named(c.bg)}, text ${named(c.text)}, muted ${named(c.muted)}, accent ${named(c.accent)} with ${named(c.accentText)} text on it, cursor ${named(c.cursor)}.`,
        `Type: headline ${font(p.type.headline)}; body ${font(p.type.body)}; mono ${font(p.type.mono)}.`,
      ]),
      `Recipe:\n\n${bullets(p.recipe)}`,
      `Don't:\n\n${bullets(p.dont)}`,
    ];
    if (p.exampleHtml) parts.push(`Example:\n\n\`\`\`html\n${p.exampleHtml.trim()}\n\`\`\``);
    return parts.join('\n\n');
  })
  .join('\n\n')}`);

  sections.push(`## Signatures

Ranked. These are what make a piece instantly JS Cebu.

${b.signatures
  .map((s) => `### ${s.rank}. ${s.name} (${s.status})\n\n${s.summary}\n\n${bullets(s.rules)}`)
  .join('\n\n')}`);

  sections.push(`## Voice

${bullets(b.voice.principles)}

${table(
  ['Bisaya', 'English', 'Use', 'Status'],
  b.voice.phrases.map((p) => [p.bisaya, p.english, p.use, p.status === 'draft' ? 'draft, not yet approved by Dorell' : 'approved']),
)}`);

  sections.push(`## Assets

${table(['Asset', 'Use', 'URL'], b.assets.map((a) => [a.label, a.use, url(a.path)]))}`);

  sections.push(`## Changelog

${b.changelog.map((v) => `### ${v.version} (${v.date})\n\n${bullets(v.notes)}`).join('\n\n')}`);

  return sections.join('\n\n') + '\n';
}
