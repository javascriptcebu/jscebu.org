/** Existing color-literal policy, shared by HTML and source checks. */
const HEX = /(?<!url\(\s*['"]?)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;

export function findColorLiteral(text: string): string | undefined {
  return (text.match(HEX) ?? text.match(COLOR_FN))?.[0];
}
