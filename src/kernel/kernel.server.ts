/**
 * Server-side kernel entry point.
 *
 * Routes and server functions call `platformKernel()` and then talk to kernel
 * APIs only — never a vendor SDK, never a table. One kernel instance is booted
 * per isolate and reused.
 */
import { bootKernel, type PulseKernel } from "./boot";
import { createLiveKernelModules, liveProviderStatus } from "./adapters/live.server";

let instance: Promise<PulseKernel> | null = null;

export function platformKernel(): Promise<PulseKernel> {
  instance ??= (async () => {
    const modules = await createLiveKernelModules();
    return bootKernel({ config: { providerMode: "live" }, modules });
  })();
  return instance;
}

export { liveProviderStatus };

/**
 * Bootstrap endpoints are privileged. They are enabled only when
 * `PULSE_BOOTSTRAP_TOKEN` is set, and every request must present it.
 */
export function authorizeBootstrap(request: Request): Response | null {
  const expected = process.env["PULSE_BOOTSTRAP_TOKEN"];
  if (!expected) {
    return Response.json({ ok: false, error: { code: "disabled", message: "bootstrap API is disabled" } }, { status: 503 });
  }
  const provided = request.headers.get("x-pulse-bootstrap-token") ?? "";
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ ok: false, error: { code: "unauthorized", message: "invalid bootstrap token" } }, { status: 401 });
  }
  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

/** Uniform JSON envelope matching `ApiResult` from `@/packages/validators`. */
export function ok<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status });
}

export function fail(code: string, message: string, status = 400, details?: Record<string, unknown>): Response {
  return Response.json({ ok: false, error: { code, message, details } }, { status });
}
