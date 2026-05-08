/**
 * E6.0 Design Tokens
 *
 * Single source of truth for visual design decisions.
 * These tokens are consumed by:
 *   - Tailwind preset (packages/config/tailwind/preset.ts) for class generation
 *   - Component library (packages/ui/src/components) for direct CSS-in-JS use
 *
 * When updating, regenerate the Tailwind theme by running:
 *   pnpm --filter @e60/config build
 */

export const colors = {
  // Canvas & surfaces
  canvas: '#f4f4f6',
  canvasEdge: '#ebebee',
  panel: '#ffffff',
  panelSoft: '#fafafb',
  panelHover: '#f7f7f9',

  // Lines
  line: '#e7e7eb',
  lineSoft: '#f0f0f3',

  // Ink (text scale, 1=darkest)
  ink: {
    1: '#0b0d12',
    2: '#424653',
    3: '#6e7280',
    4: '#9b9ea7',
    5: '#c2c4cb',
  },

  // Sidebar (primary, light theme)
  side: {
    bg: '#f8f8fa',
    border: '#e9e9ec',
    icon: '#6b6e78',
    iconHover: '#1c1f26',
    activeBg: '#ffffff',
    activeBorder: '#e3e3e7',
  },

  // NFQ palette · vibrant accents
  // Note: these HEX values are placeholders pending the official NFQ brand guide.
  // Once the manual NFQ HEX codes arrive, update only these values — everything
  // downstream (Tailwind, components) regenerates from here.
  nfq: {
    red: '#f04e3e',
    redSoft: '#ff7868',
    redBg: '#fef0ee',
    orange: '#ff8c2d',
    orangeSoft: '#ffa75e',
    orangeBg: '#fef3e8',
    blue: '#3b6cf3',
    blueSoft: '#6b8ef5',
    blueBg: '#ecf0fe',
    purple: '#7a4cf0',
    purpleSoft: '#9d77f5',
    purpleBg: '#f0eafe',
    green: '#1aa56a',
    greenSoft: '#4cc28a',
    greenBg: '#e8f7ee',
    amber: '#d99514',
  },

  // Status semantics (mapped to NFQ where appropriate)
  status: {
    ok: '#1aa56a',
    warn: '#d99514',
    err: '#f04e3e',
    info: '#3b6cf3',
  },
} as const;

export const radii = {
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(11, 13, 18, 0.04)',
  md: '0 1px 3px rgba(11, 13, 18, 0.06), 0 0 0 1px rgba(11, 13, 18, 0.02)',
  lg: '0 4px 12px rgba(11, 13, 18, 0.08)',
  pop: '0 8px 24px rgba(11, 13, 18, 0.12)',
} as const;

export const typography = {
  fontFamily: {
    body: ['Inter', '-apple-system', 'system-ui', 'sans-serif'].join(', '),
    mono: ['JetBrains Mono', 'SF Mono', 'monospace'].join(', '),
  },
  // Sizes are in rem for accessibility, but match the px equivalents
  // used in the HTML mockups (1rem = 16px).
  fontSize: {
    xs: '0.625rem',     // 10px — meta pills, tags
    sm: '0.6875rem',    // 11px — sublabels
    base: '0.78125rem', // 12.5px — body
    md: '0.8125rem',    // 13px — emphasis body
    lg: '1rem',         // 16px — drawer titles
    xl: '1.125rem',     // 18px — section headers
    '2xl': '1.5rem',    // 24px — page titles
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.04em',
    wider: '0.1em',
    widest: '0.14em',
  },
} as const;

export const layout = {
  sidebar: {
    primaryWidth: '64px',
    secondaryWidth: '220px',
    topbarHeight: '52px',
  },
  drawer: {
    width: '720px',
  },
  // breakpoints below which layout adapts (e.g. KpiCards shrink)
  breakpoint: {
    cramped: '1300px',
    standard: '1400px',
    wide: '1500px',
  },
} as const;

export const tokens = {
  colors,
  radii,
  shadows,
  typography,
  layout,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colors;
export type NfqColor = keyof typeof colors.nfq;
