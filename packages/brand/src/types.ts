export type Hex = `#${string}`;
export type FontId = 'archivo' | 'spaceGrotesk' | 'interTight' | 'jetbrainsMono' | 'roboto';
export type PersonalityId = 'poster' | 'terminal' | 'journal';

export interface ColorToken { id: 'yellow' | 'ink' | 'paper'; hex: Hex; role: string }

export interface FontToken {
  id: FontId;
  family: string;
  cssStack: string;
  googleFontsUrl: string;
  fontsourcePackage: string;
  weights: number[];
  role: string;
}

export interface FontRef { font: FontId; weight: number; uppercase?: boolean }

export interface Personality {
  id: PersonalityId;
  name: string;
  use: string;
  colors: { bg: Hex; text: Hex; muted: Hex; accent: Hex; accentText: Hex; cursor: Hex };
  type: { headline: FontRef; body: FontRef; mono: FontRef };
  recipe: string[];
  dont: string[];
  exampleHtml: string;
}

export interface Signature {
  rank: 1 | 2 | 3 | 4;
  id: 'cursor' | 'sticker' | 'bisaya' | 'photos';
  name: string;
  status: 'core' | 'experimental';
  summary: string;
  rules: string[];
}

export interface MustRule { id: string; text: string }

export interface Phrase { bisaya: string; english: string; use: string; status: 'draft' | 'approved' }

export interface Asset { id: string; label: string; path: `/brand/${string}`; use: string }

export interface TextPair { fg: Hex; bg: Hex; where: string; large?: boolean }

export interface Brand {
  name: 'JavaScript Cebu';
  version: string;
  site: 'https://www.jscebu.org';
  colors: ColorToken[];
  fonts: FontToken[];
  personalities: Personality[];
  signatures: Signature[];
  must: MustRule[];
  /** Clear space, minimum sizes, which version on which background, sticker tilt and edge. */
  logoRules: string[];
  voice: { principles: string[]; phrases: Phrase[] };
  assets: Asset[];
  textPairs: TextPair[];
  changelog: { version: string; date: string; notes: string[] }[];
}
