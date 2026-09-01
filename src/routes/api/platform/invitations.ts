/**
 * POST /api/platform/invitations — issue a membership invitation.
 * GET  /api/platform/invitations?organizationId=… — list them (tokens redacted).
 *
 * Backed only by the Identity Kernel's invitation service.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeBootstrap, fail, ok, platformKernel } from "@/kernel/kernel.server";
import type { IdentityKernelApi } from "@/kernel/contracts/identity";
import { redactInvitation } from "@/kernel/adapters/invitations";
import { email, roleName, uuid } from "@/packages/validators";

const body = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable().default(null),
  email,
  role: roleName.default("member"),
  ttlDays: z.number().int().min(1).max(60).default(14),
});

export const Route = createFileRoute("/api/platform/invitations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;

        const parsed = body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("invalid_input", "invalid invitation payload", 422, { issues: parsed.error.issues });

        const kernel = await platformKernel();
        const identity = kernel.get<IdentityKernelApi>("identity");
        try {
          const invitation = await identity.invitations.issue(parsed.data);
          // The token is returned exactly once, to the privileged bootstrap caller.
          return ok({ invitation: redactInvitation(invitation), token: invitation.token }, 201);
        } catch (error) {
          return fail("kernel_error", (error as Error).message, 500);
        }
      },
      GET: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;
        const organizationId = new URL(request.url).searchParams.get("organizationId");
        if (!organizationId || !uuid.safeParse(organizationId).success) {
          return fail("invalid_input", "organizationId query parameter is required", 422);
        }
        const kernel = await platformKernel();
        const identity = kernel.get<IdentityKernelApi>("identity");
        const invitations = await identity.invitations.list(organizationId);
        return ok({ invitations: invitations.map(redactInvitation) });
      },
      PATCH: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;
        const parsed = z
          .object({ token: z.string().min(16).max(256) })
          .safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("invalid_input", "an invitation token is required", 422);
        const kernel = await platformKernel();
        const identity = kernel.get<IdentityKernelApi>("identity");
        try {
          return ok({ invitation: redactInvitation(await identity.invitations.accept(parsed.data.token)) });
        } catch (error) {
          return fail("kernel_error", (error as Error).message, 409);
        }
      },
    },
  },
});
