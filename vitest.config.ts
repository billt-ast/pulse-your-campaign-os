import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Unit / smoke test runner. Kept separate from vite.config.ts so the app build
 * never depends on test tooling.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    reporters: ["default"],
  },
});
