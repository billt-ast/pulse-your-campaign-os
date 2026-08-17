/** Design Kernel — the visual runtime inherited from Phase 2A. */
import type { KernelMeta } from "../types";

export interface DesignTokens {
  color: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  motion: Record<string, string>;
}
export interface DesignKernelApi {
  tokens(): DesignTokens;
  theme(): "light" | "dark" | "system";
  setTheme(theme: "light" | "dark" | "system"): void;
  chartPalette(): string[];
}
export const designKernelMeta: KernelMeta = {
  id: "design",
  name: "Design Kernel",
  purpose: "Design tokens, typography, color, spacing, motion, charts, maps and accessibility.",
  dependencies: ["context"],
  publishes: ["design.theme_changed"],
  consumes: ["context.changed"],
  extensionPoints: ["token.pack", "component.variant"],
};
