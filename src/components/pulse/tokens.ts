/**
 * Pulse Design Tokens
 * ---------------------------------------------------------------------------
 * Single source of truth for spacing, motion and semantic color aliases used
 * across the authenticated Pulse experience. All raw values (colors, fonts,
 * radii) are defined in `src/styles.css` under @theme and re-exported here
 * only when JS needs the reference (e.g. framer-motion, charts).
 * ---------------------------------------------------------------------------
 */

export const motion = {
  ease: {
    entrance: [0.16, 1, 0.3, 1] as const,
    exit: [0.7, 0, 0.84, 0] as const,
    swift: [0.4, 0, 0.2, 1] as const,
  },
  duration: {
    fast: 0.18,
    base: 0.32,
    slow: 0.6,
    cinematic: 1.1,
  },
  stagger: {
    tight: 0.04,
    base: 0.08,
    wide: 0.14,
  },
} as const;

export const palette = {
  paper: "var(--paper)",
  ink: "var(--ink)",
  graphite: "var(--graphite)",
  hairline: "var(--hairline)",
  navy: "var(--navy)",
  navySoft: "var(--navy-soft)",
  civic: "var(--civic)",
  civicSoft: "var(--civic-soft)",
} as const;

export const chartColors = [
  "var(--navy)",
  "var(--civic)",
  "var(--navy-soft)",
  "var(--civic-soft)",
  "var(--graphite)",
] as const;

export const layout = {
  sidebarWidth: 264,
  sidebarCollapsedWidth: 72,
  topbarHeight: 64,
  contentMaxWidth: 1440,
} as const;
