/**
 * GET /api/platform/health — kernel + provider health.
 *
 * Reports every kernel's health in boot order plus which live providers this
 * process can reach, so a deployment can be verified without a UI.
 */
import { createFileRoute } from "@tanstack/react-router";
import { authorizeBootstrap, liveProviderStatus, ok, platformKernel } from "@/kernel/kernel.server";

export const Route = createFileRoute("/api/platform/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;
        const kernel = await platformKernel();
        const kernels = await kernel.health();
        return ok({
          providerMode: kernel.config.providerMode,
          bootOrder: kernel.bootOrder,
          providers: liveProviderStatus(),
          kernels,
          status: kernels.some((k) => k.status === "unavailable")
            ? "unavailable"
            : kernels.some((k) => k.status === "degraded")
              ? "degraded"
              : "healthy",
        });
      },
    },
  },
});
