/**
 * design contracts — Design Kernel surface.
 *
 * Tokens, themes, chart/map palettes, motion and accessibility guarantees.
 * Applications read tokens through this contract, never hardcoded values.
 */
import { z } from "zod";

export const themeMode = z.enum(["light", "dark", "system"]);

export const designTokens = z.object({
  color: z.record(z.string(), z.string()),
  typography: z.record(z.string(), z.string()),
  spacing: z.record(z.string(), z.string()),
  radius: z.record(z.string(), z.string()),
  motion: z.record(z.string(), z.string()),
});
export type DesignTokens = z.infer<typeof designTokens>;

export const chartPaletteResponse = z.object({
  colors: z.array(z.string().min(3).max(64)).min(3),
  neutral: z.string().min(3).max(64),
});

export const mapPaletteResponse = z.object({
  basemap: z.enum(["light", "dark", "satellite"]),
  choropleth: z.array(z.string().min(3).max(64)).min(3),
  accent: z.string().min(3).max(64),
});

export const motionPreference = z.object({
  reducedMotion: z.boolean().default(false),
  durations: z.record(z.string(), z.number().nonnegative()),
});

export const accessibilityContract = z.object({
  minContrastRatio: z.number().min(3).max(21).default(4.5),
  minTapTargetPx: z.number().int().min(24).max(64).default(44),
  focusVisible: z.literal(true),
  respectsReducedMotion: z.literal(true),
});
export type AccessibilityContract = z.infer<typeof accessibilityContract>;

export const setThemeRequest = z.object({ theme: themeMode });
