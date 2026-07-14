/**
 * @pulse/environment
 * ---------------------------------------------------------------------------
 * Zod-validated environment access. Split into two entry points:
 *
 *   - `clientEnv()` — parses `import.meta.env.*` (VITE_-prefixed only). Safe
 *     to call from any runtime. Throws a formatted error listing every
 *     missing / malformed variable.
 *   - `serverEnv()` — parses `process.env.*`. Server-only; call it inside
 *     server functions, server routes, or at server startup. Result is
 *     cached per-process.
 *
 * The goal is a single, clear failure mode: if configuration is wrong, the
 * app refuses to boot and tells the operator exactly which variables need
 * attention — never a silent `undefined` deep inside a request.
 * ---------------------------------------------------------------------------
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Client (browser + SSR)                                              */
/* ------------------------------------------------------------------ */

const clientSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
});
export type ClientEnv = z.infer<typeof clientSchema>;

let cachedClient: ClientEnv | undefined;
export function clientEnv(): ClientEnv {
  if (cachedClient) return cachedClient;
  const parsed = clientSchema.safeParse(import.meta.env);
  if (!parsed.success) throw formatEnvError("client", parsed.error);
  cachedClient = parsed.data;
  return cachedClient;
}

/* ------------------------------------------------------------------ */
/* Server                                                              */
/* ------------------------------------------------------------------ */

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "preview", "production", "test"])
    .default("development"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
  LOVABLE_API_KEY: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServer: ServerEnv | undefined;
export function serverEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) throw formatEnvError("server", parsed.error);
  cachedServer = parsed.data;
  return cachedServer;
}

/** Boot-time assertion — call once at server startup to fail fast. */
export function assertServerEnv(): ServerEnv {
  try {
    return serverEnv();
  } catch (error) {
    // Re-throw so the SSR error boundary renders a helpful page, but also
    // log a structured breadcrumb the operator can grep for.
    // eslint-disable-next-line no-console
    console.error("[pulse:env] startup validation failed", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Error formatting                                                    */
/* ------------------------------------------------------------------ */

function formatEnvError(scope: "client" | "server", error: z.ZodError): Error {
  const issues = error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  return new Error(
    `[pulse:env] ${scope} environment is misconfigured:\n${issues}\n` +
      `Check .env / .env.example and your secret store, then restart.`,
  );
}
