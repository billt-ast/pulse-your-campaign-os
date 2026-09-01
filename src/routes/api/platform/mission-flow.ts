/**
 * POST /api/platform/mission-flow — run an end-to-end test mission flow.
 *
 * Creates a mission, starts its lifecycle workflow, drives it through approval
 * to `active`, and returns the emitted event trace. Every step goes through the
 * Mission, Workflow, Event and Context kernels — nothing else.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeBootstrap, fail, ok, platformKernel } from "@/kernel/kernel.server";
import type { MissionKernelApi } from "@/kernel/contracts/mission";
import type { WorkflowKernelApi } from "@/kernel/contracts/workflow";
import type { EventKernelApi } from "@/kernel/contracts/event";
import type { ContextKernelApi } from "@/kernel/contracts/context";
import type { DomainEventEnvelope } from "@/kernel/events";
import { missionType, nonEmptyString, slug, uuid } from "@/packages/validators";

const body = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable().default(null),
  name: nonEmptyString.max(200).default("Kernel smoke mission"),
  slug: slug.default("kernel-smoke-mission"),
  type: missionType.default("campaign"),
  approverId: uuid.nullable().default(null),
});

export const Route = createFileRoute("/api/platform/mission-flow")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = authorizeBootstrap(request);
        if (denied) return denied;

        const parsed = body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("invalid_input", "invalid mission payload", 422, { issues: parsed.error.issues });

        const kernel = await platformKernel();
        const missions = kernel.get<MissionKernelApi>("mission");
        const workflow = kernel.get<WorkflowKernelApi>("workflow");
        const events = kernel.get<EventKernelApi>("event");
        const context = kernel.get<ContextKernelApi>("context");

        const trace: { name: string; payload: unknown }[] = [];
        const unsubscribe = events.bus.subscribe("*", async (event: DomainEventEnvelope) => {
          trace.push({ name: event.name, payload: event.payload });
        });

        try {
          const steps: Record<string, unknown> = {};
          const mission = await missions.missions.create({
            name: parsed.data.name,
            slug: `${parsed.data.slug}-${Date.now().toString(36)}`,
            type: parsed.data.type,
            organizationId: parsed.data.organizationId,
            workspaceId: parsed.data.workspaceId,
          });
          steps["created"] = mission;

          const instance = await workflow.start("mission.lifecycle", { type: "mission", id: mission.id });
          steps["workflowStarted"] = instance;

          steps["planned"] = await workflow.send(instance.id, "plan");
          steps["missionPlanning"] = await missions.missions.transition(mission.id, "planning");

          // "launch" requires approval, so the first send escalates.
          steps["launchRequested"] = await workflow.send(instance.id, "launch");
          steps["launchApproved"] = await workflow.approve(
            instance.id,
            parsed.data.approverId ?? "00000000-0000-0000-0000-000000000000",
          );
          steps["missionActive"] = await missions.missions.transition(mission.id, "active");

          await events.bus.drain();
          return ok({
            steps,
            events: trace,
            context: { requestId: context.current().requestId, providerMode: kernel.config.providerMode },
          }, 201);
        } catch (error) {
          return fail("kernel_error", (error as Error).message, 500, { events: trace });
        } finally {
          unsubscribe();
        }
      },
    },
  },
});
