import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { assertServerEnv } from "@/libs/environment";
import { logger } from "@/libs/logging";

// Fail-fast env validation — throws a formatted error listing every missing
// or malformed variable if the server is misconfigured at startup.
try {
  assertServerEnv();
  logger.info("server env validated");
} catch (error) {
  logger.error("server env validation failed", { error: (error as Error).message });
  throw error;
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
