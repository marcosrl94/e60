/**
 * E6.0 Tailwind preset
 *
 * Reads design tokens from @e60/ui/tokens and exposes them as Tailwind
 * theme extensions. Apps and packages should consume this preset rather
 * than defining their own Tailwind config from scratch.
 *
 * Usage in app:
 *   // tailwind.config.ts
 *   import { e60Preset } from '@e60/config/tailwind';
 *   export default { presets: [e60Preset], content: [...] };
 */

import type { Config } from 'tailwindcss';
import { tokens } from '@e60/ui/tokens';

const { colors, radii, shadows, typography, layout } = tokens;

export const e60Preset = {
  content: [],
  theme: {
    extend: {
      colors: {
        canvas: colors.canvas,
        'canvas-edge': colors.canvasEdge,
        panel: colors.panel,
        'panel-soft': colors.panelSoft,
        'panel-hover': colors.panelHover,
        line: colors.line,
        'line-soft': colors.lineSoft,
        ink: colors.ink,
        side: colors.side,
        nfq: colors.nfq,
        ok: colors.status.ok,
        warn: colors.status.warn,
        err: colors.status.err,
        info: colors.status.info,
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
      },
      boxShadow: {
        'e60-sm': shadows.sm,
        'e60-md': shadows.md,
        'e60-lg': shadows.lg,
        'e60-pop': shadows.pop,
      },
      fontFamily: {
        sans: typography.fontFamily.body.split(', '),
        mono: typography.fontFamily.mono.split(', '),
      },
      fontSize: typography.fontSize,
      letterSpacing: typography.letterSpacing,
      spacing: {
        'sidebar-1': layout.sidebar.primaryWidth,
        'sidebar-2': layout.sidebar.secondaryWidth,
        topbar: layout.sidebar.topbarHeight,
        drawer: layout.drawer.width,
      },
      screens: {
        cramped: { max: layout.breakpoint.cramped },
        standard: { max: layout.breakpoint.standard },
        wide: { max: layout.breakpoint.wide },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default e60Preset;
