import type { Asset, Brand, Hex } from './types.ts';

const yellow: Hex = '#FFDF00';
const ink: Hex = '#0E0F11';
const paper: Hex = '#F4F1EA';

/** Terminal's background grid and hairlines: white at low opacity over ink. */
export const terminalGrid = 'rgba(255,255,255,0.045)';
export const terminalLine = 'rgba(255,255,255,0.08)';

const google = (family: string, weights: number[]) =>
  `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weights.join(';')}&display=swap`;

/** Each logo file ships as an SVG master and a PNG export at the same path. */
const logo = (id: string, label: string, use: string): Asset[] => [
  { id, label: `${label} (SVG)`, path: `/brand/logo/${id}.svg`, use },
  { id: `${id}-png`, label: `${label} (PNG)`, path: `/brand/logo/${id}.png`, use },
];

export const brand: Brand = {
  name: 'JavaScript Cebu',
  version: '0.1.0',
  site: 'https://www.jscebu.org',

  colors: [
    { id: 'yellow', hex: yellow, role: 'JS Cebu yellow. Leads every piece: backgrounds, headlines on ink, buttons, the cursor, the highlighter. Never a text color on paper.' },
    { id: 'ink', hex: ink, role: 'Near-black. Text on yellow and paper, the Terminal background, the Poster footer bar.' },
    { id: 'paper', hex: paper, role: 'Warm off-white. The Journal background.' },
  ],

  fonts: [
    {
      id: 'archivo',
      family: 'Archivo',
      cssStack: "'Archivo Variable', 'Archivo', 'Arial Black', sans-serif",
      googleFontsUrl: google('Archivo', [600, 900]),
      fontsourcePackage: '@fontsource-variable/archivo',
      weights: [600, 900],
      role: 'Poster headlines (900, uppercase) and body (600). A heavy grotesque that sits well beside the wordmark.',
    },
    {
      id: 'spaceGrotesk',
      family: 'Space Grotesk',
      cssStack: "'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif",
      googleFontsUrl: google('Space Grotesk', [400, 700]),
      fontsourcePackage: '@fontsource-variable/space-grotesk',
      weights: [400, 700],
      role: 'Terminal headlines (700) and body (400).',
    },
    {
      id: 'interTight',
      family: 'Inter Tight',
      cssStack: "'Inter Tight Variable', 'Inter Tight', system-ui, sans-serif",
      googleFontsUrl: google('Inter Tight', [400, 800]),
      fontsourcePackage: '@fontsource-variable/inter-tight',
      weights: [400, 800],
      role: 'Journal headlines (800, sentence case) and body (400).',
    },
    {
      id: 'jetbrainsMono',
      family: 'JetBrains Mono',
      cssStack: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace",
      googleFontsUrl: google('JetBrains Mono', [400, 600]),
      fontsourcePackage: '@fontsource-variable/jetbrains-mono',
      weights: [400, 600],
      role: 'Labels, metadata, the event line and code, in every personality.',
    },
    {
      id: 'roboto',
      family: 'Roboto',
      cssStack: "'Roboto', sans-serif",
      googleFontsUrl: google('Roboto', [900]),
      fontsourcePackage: '@fontsource/roboto',
      weights: [900],
      role: 'The wordmark only (Roboto Black). It is already outlined in the logo files, so never set other text in it.',
    },
  ],

  personalities: [
    {
      id: 'poster',
      name: 'Poster',
      use: 'Social media posts and event graphics.',
      colors: { bg: yellow, text: ink, muted: '#4A4316', accent: ink, accentText: yellow, cursor: ink },
      type: {
        headline: { font: 'archivo', weight: 900, uppercase: true },
        body: { font: 'archivo', weight: 600 },
        mono: { font: 'jetbrainsMono', weight: 600 },
      },
      recipe: [
        'Background: yellow. Text: ink.',
        'Margins: about 7% of the canvas width on every side.',
        'Label above the headline: JetBrains Mono 600, uppercase, letter-spacing 0.08em, muted color.',
        'Headline: Archivo 900, uppercase, line-height 0.9, letter-spacing -0.02em, about 10% of the canvas width. It ends with the ink cursor.',
        'Agenda: up to 3 lines in Archivo 600, each starting with a mono time or label.',
        'Logo: the sticker in a top corner at about 20% of the canvas width, or the ink one-color lockup.',
        'Footer: a full-width ink bar holding the event line in JetBrains Mono 600, yellow on ink, e.g. SAT NOV 21 · 2PM · CEBU CITY · JSCEBU.ORG.',
      ],
      dont: [
        'No full-color flat logo on yellow. Use the sticker or the one-color lockup.',
        'No sentence-case or light-weight headlines. That is Journal.',
        'No gradients, extra colors or hexagon shapes.',
        'No more than one cursor.',
      ],
      exampleHtml: '',
    },
    {
      id: 'terminal',
      name: 'Terminal',
      use: 'The website and anything read on screen: slides, docs, dashboards.',
      colors: { bg: ink, text: '#E9E9EC', muted: '#9C9CA3', accent: yellow, accentText: ink, cursor: yellow },
      type: {
        headline: { font: 'spaceGrotesk', weight: 700 },
        body: { font: 'spaceGrotesk', weight: 400 },
        mono: { font: 'jetbrainsMono', weight: 400 },
      },
      recipe: [
        `Background: ink with a 24px grid of 1px lines in ${terminalGrid}.`,
        'Headline: Space Grotesk 700, yellow, line-height 1, letter-spacing -0.02em. It ends with the yellow cursor, which blinks on the web.',
        'Body: Space Grotesk 400 in the Terminal text color. Labels, metadata and code: JetBrains Mono 400 in the muted color.',
        'Section labels: mono, uppercase, letter-spacing 0.1em. A `// ` prefix is welcome.',
        'Primary button: yellow background, ink text, JetBrains Mono 600, 6px radius. Secondary button: transparent with a 1px light border.',
        'Logo: the dark flat lockup in the nav, the sticker in the hero.',
        `Separate sections with 1px hairlines in ${terminalLine}.`,
      ],
      dont: [
        'No yellow body text. Yellow is for the headline, links, the primary button and the cursor.',
        'No neon glows, gradients or other accent colors.',
        'No more than one cursor on a screen.',
      ],
      exampleHtml: '',
    },
    {
      id: 'journal',
      name: 'Journal',
      use: 'Stories, event recaps and long reads.',
      colors: { bg: paper, text: ink, muted: '#6B675F', accent: yellow, accentText: ink, cursor: yellow },
      type: {
        headline: { font: 'interTight', weight: 800 },
        body: { font: 'interTight', weight: 400 },
        mono: { font: 'jetbrainsMono', weight: 400 },
      },
      recipe: [
        'Background: paper. Text: ink.',
        'Headline: Inter Tight 800, sentence case, line-height 1.05, letter-spacing -0.03em. It ends with the yellow cursor.',
        'Key phrase: a yellow highlighter band behind one phrase of the headline or a pull quote, ink text on yellow.',
        'Editorial rules: a 1px ink line above each section label. Labels and captions: JetBrains Mono 400, uppercase, muted color.',
        'Body: Inter Tight 400, 1.6 line-height, about 65 characters per line.',
        'Photos: real and unfiltered, full-bleed or in a simple grid with mono captions.',
        'Logo: the light flat lockup in the header, or the sticker on a photo.',
      ],
      dont: [
        'No yellow text on paper. Yellow appears only as the highlighter band, a fill or the cursor.',
        'No uppercase headlines. That is Poster.',
        'No Terminal grid on paper.',
      ],
      exampleHtml: '',
    },
  ],

  signatures: [
    {
      rank: 1,
      id: 'cursor',
      name: 'The cursor',
      status: 'core',
      summary: 'The primary headline ends with a solid block cursor.',
      rules: [
        "Size: about 0.5em wide by 0.8em tall at the headline's size, sitting on the baseline.",
        'Color is the contrast color: ink on yellow; yellow on ink or paper.',
        'It never wraps alone: wrap the last word and the cursor together with white-space: nowrap (the jc-nw class).',
        'On the web it blinks (1.05s, steps(1)), stays still under prefers-reduced-motion, and is aria-hidden. In images it does not blink.',
        'One cursor per piece or screen, on the primary headline only.',
      ],
    },
    {
      rank: 2,
      id: 'sticker',
      name: 'The sticker',
      status: 'core',
      summary: 'The logo as a tilted die-cut sticker, from laptop-sticker culture at meetups.',
      rules: [
        'Rotate the full-color mark 6–10° in either direction. The default is -8°.',
        "A white die-cut edge 5% of the mark's width. A soft shadow is optional.",
        'For expressive moments: graphics, the hero, merch. Nav, footer, sponsor walls and small sizes use the flat lockup.',
        'Use the ready-made sticker files. Do not redraw the edge.',
      ],
    },
    {
      rank: 3,
      id: 'bisaya',
      name: 'Bisaya, lightly',
      status: 'experimental',
      summary: 'English first, with a little Bisaya in sign-offs, recaps and calls to action.',
      rules: [
        'English first. Bisaya only in sign-offs, recaps and calls to action.',
        'Never use Bisaya in place of essential information: dates, venues, prices or instructions.',
        'Use phrases from the list. Phrases marked draft are still being tested.',
      ],
    },
    {
      rank: 4,
      id: 'photos',
      name: 'Real photos',
      status: 'core',
      summary: 'Real photos of the community, never filtered.',
      rules: [
        'No duotone, yellow tint or filters on photos of people.',
        'On top of a photo you may add only the sticker, a caption, and a dark gradient for legibility.',
        'After every event, update the facebook.com/javascriptcebu cover photo with a real photo from it, using the fb-cover template.',
      ],
    },
  ],

  must: [
    { id: 'yellow', text: 'JS Cebu yellow `#FFDF00` appears.' },
    { id: 'logo-form', text: 'The logo is the sticker (tilted 6–10°, white die-cut edge), or the flat lockup in nav, footer, sponsor walls or small sizes.' },
    { id: 'logo-on-yellow', text: 'On a yellow background, any flat logo is the one-color version.' },
    { id: 'cursor', text: 'The primary headline ends with a block cursor in the contrast color, and the cursor never wraps onto its own line.' },
    { id: 'one-personality', text: "The piece uses one personality's recipe (Poster, Terminal or Journal), not a mix." },
    { id: 'fonts', text: 'It uses only the approved fonts.' },
    { id: 'photos', text: 'Photos are real and unfiltered.' },
    { id: 'no-hexagons', text: 'No hexagon shapes besides the logo.' },
    { id: 'event-line', text: 'Event graphics include the mono event line with jscebu.org.' },
    { id: 'bisaya', text: 'Any Bisaya is in sign-offs, recaps or CTAs, never in place of essential information.' },
  ],

  logoRules: [
    'The horizontal "JAVASCRIPT / CEBU" lockup is canonical. The stacked "CEBU.JS" lockup is retired.',
    'Clear space on all sides equals the height of the "C" in CEBU. For the mark alone, it is 25% of the mark\'s height.',
    'Minimum sizes: the mark at 24px tall on screen, the lockup at 120px wide. Below 120px, use the mark alone.',
    'On yellow, use the ink or white one-color versions. On ink or paper, use the full-color lockup (dark on ink, light on paper). For expressive placements, use the sticker.',
    "The sticker tilts 6–10° in either direction and has a white edge of 5% of the mark's width.",
    'Never recolor, stretch, outline or add effects to the logo, and never place it inside another hexagon.',
  ],

  voice: {
    principles: [
      'English first: clear, friendly and direct, like a fellow developer talking.',
      'Lead with what, when and where.',
      'Bisaya lightly, in sign-offs, recaps and calls to action only, never in place of essential information.',
      'Event graphics carry the mono event line: WHEN · WHERE · JSCEBU.ORG, e.g. SAT NOV 21 · 2PM · CEBU CITY · JSCEBU.ORG.',
    ],
    phrases: [
      { bisaya: 'Salamat', english: 'Thanks', use: 'Sign-offs and thank-you posts', status: 'draft' },
      { bisaya: 'Kita-kits', english: 'See you', use: 'The end of event announcements', status: 'draft' },
      { bisaya: 'Padayon', english: 'Keep going', use: 'Recaps and encouragement', status: 'draft' },
      { bisaya: 'Code ta!', english: "Let's code", use: 'Calls to action for workshops and hack nights', status: 'draft' },
      { bisaya: 'Apil na', english: 'Join now', use: 'Registration calls to action, next to the link', status: 'draft' },
    ],
  },

  assets: [
    ...logo('lockup-light', 'Flat lockup, light', 'On paper and other light backgrounds: nav, footer, sponsor walls.'),
    ...logo('lockup-dark', 'Flat lockup, dark', 'On ink and other dark backgrounds.'),
    ...logo('lockup-ink', 'One-color lockup, ink', 'On yellow backgrounds.'),
    ...logo('lockup-white', 'One-color lockup, white', 'On yellow or photos where white reads better.'),
    ...logo('mark-color', 'Full-color mark', 'Small square spots and avatars on ink or paper.'),
    ...logo('mark-ink', 'One-color mark, ink', 'Small square spots on yellow.'),
    ...logo('mark-white', 'One-color mark, white', 'Small square spots on dark photos.'),
    ...logo('sticker', 'Sticker', 'Expressive placements: graphics, the hero, merch. Rotate it 6–10°.'),
    { id: 'sticker-tilted', label: 'Sticker, tilted -8° (PNG)', path: '/brand/logo/sticker-tilted.png', use: 'Drop straight into graphics.' },
    { id: 'tokens', label: 'tokens.css', path: '/brand/tokens.css', use: 'CSS custom properties and the cursor, sticker and highlighter classes. Link it from any HTML you make.' },
    { id: 'event-post', label: 'Event post template (Poster, 1080×1080)', path: '/brand/templates/event-post.html', use: 'Copy it, change the text, render it to PNG.' },
    { id: 'fb-cover', label: 'Facebook cover template', path: '/brand/templates/fb-cover.html', use: 'The post-event cover photo ritual.' },
    { id: 'photo', label: 'Sample community photo', path: '/brand/photos/community-meetup.jpg', use: 'Placeholder in the templates. Replace it with a real photo from your event.' },
  ],

  textPairs: [
    { fg: ink, bg: yellow, where: 'Poster headline and body' },
    { fg: '#4A4316', bg: yellow, where: 'Poster labels and metadata (muted)' },
    { fg: yellow, bg: ink, where: 'Poster footer bar event line' },
    { fg: yellow, bg: ink, where: 'Terminal headline and links' },
    { fg: '#E9E9EC', bg: ink, where: 'Terminal body text' },
    { fg: '#9C9CA3', bg: ink, where: 'Terminal labels and metadata (muted)' },
    { fg: ink, bg: yellow, where: 'Terminal primary button' },
    { fg: ink, bg: paper, where: 'Journal headline and body' },
    { fg: '#6B675F', bg: paper, where: 'Journal labels and captions (muted)' },
    { fg: ink, bg: yellow, where: 'Journal highlighter band' },
  ],

  changelog: [
    {
      version: '0.1.0',
      date: '2026-10-28',
      notes: [
        'First release: yellow, ink and paper; three personalities (Poster, Terminal, Journal); four signatures (cursor, sticker, Bisaya, real photos); the MUST checklist; logos rebuilt as SVG from the original PSD; event post and Facebook cover templates.',
      ],
    },
  ],
};
