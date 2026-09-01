/**
 * POST /api/platform/organizations — bootstrap a tenant.
 *
 * Creates an organization plus its first workspace through the Mission Kernel.
 * The route touches no database and no vendor SDK: kernel APIs only.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeBootstrap, fail, ok, platformKernel } from "@/kernel/kernel.server";
import type { MissionKernelApi } from "@/kernel/contracts/mission";
import type { DataKernelApi } from "@/kernel/contracts/data";
import type { Workspace } from "@/packages/validators";
import { organization, slug, nonEmptyString } from "@/packages/validators";

const body = z.object({
  name: nonEmptyString.max(160),
  slug,
  kind: organization.shape.kind.default("other"),
  workspaceName: nonEmptyString.max(160).default("Headquarters"),
  workspaceSlug: slug.default("hq"),
});

export const Route = createFileRoute("/api/platform/organizations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;

        const parsed = body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("invalid_input", "invalid organization payload", 422, { issues: parsed.error.issues });

        const kernel = await platformKernel();
        const missions = kernel.get<MissionKernelApi>("mission");
        const data = kernel.get<DataKernelApi>("data");

        try {
          const org = await missions.organizations.create({
            name: parsed.data.name,
            slug: parsed.data.slug,
            kind: parsed.data.kind,
          });
          const now = new Date().toISOString();
          const workspace = await data.repository<Workspace>("workspaces").create({
            organizationId: org.id,
            name: parsed.data.workspaceName,
            slug: parsed.data.workspaceSlug,
            createdAt: now,
            updatedAt: now,
            createdBy: null,
            updatedBy: null,
          });
          return ok({ organization: org, workspace, provider: data.providerFor("organizations") }, 201);
        } catch (error) {
          return fail("kernel_error", (error as Error).message, 500);
        }
      },
      GET: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;
        const kernel = await platformKernel();
        const missions = kernel.get<MissionKernelApi>("mission");
        return ok({ organizations: await missions.organizations.list() });
      },
    },
  },
});
