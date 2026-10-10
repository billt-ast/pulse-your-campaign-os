import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Rocket } from "lucide-react";
import { AppShell, PulseCard, SectionHeading, Reveal } from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  advanceMission,
  createMissionWithWorkflow,
  setMissionVisibility,
  listWorkspaceOverview,
  type LifecycleAction,
} from "@/lib/mission-control.functions";
import {
  ACTION_LABEL,
  MISSION_TYPES,
  NEXT_ACTIONS,
  STATUS_TONE,
  missionControlKey,
  titleCase,
} from "@/lib/mission-control";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({
    meta: [
      { title: "Missions — Pulse Mission Control" },
      { name: "description", content: "Create missions and drive them from draft through planning, launch approval, active and completion." },
      { property: "og:title", content: "Missions — Pulse Mission Control" },
      { property: "og:description", content: "Create missions and drive them through the full Pulse lifecycle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissionsPage,
});

function MissionsPage() {
  const overview = useServerFn(listWorkspaceOverview);
  const createMission = useServerFn(createMissionWithWorkflow);
  const advance = useServerFn(advanceMission);
  const setVisibility = useServerFn(setMissionVisibility);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: missionControlKey, queryFn: () => overview() });
  const orgs = data?.organizations ?? [];
  const missions = data?.missions ?? [];

  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof MISSION_TYPES)[number]>("campaign");

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.organization.id === (organizationId || orgs[0]?.organization.id)),
    [orgs, organizationId],
  );

  const create = useMutation({
    mutationFn: () =>
      createMission({
        data: {
          organizationId: selectedOrg!.organization.id,
          workspaceId: selectedOrg!.workspaces[0]?.id ?? null,
          name,
          type,
        },
      }),
    onSuccess: (row) => {
      toast.success(`“${row.mission.name}” created — lifecycle workflow started`);
      setName("");
      void queryClient.invalidateQueries({ queryKey: missionControlKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not create mission"),
  });

  const step = useMutation({
    mutationFn: (vars: { missionId: string; action: LifecycleAction }) => advance({ data: vars }),
    onSuccess: (row) => {
      toast.success(`${row.mission.name} → ${titleCase(row.mission.status)}`, {
        description: row.trace.map((t) => t.name).join(" · ") || undefined,
      });
      void queryClient.invalidateQueries({ queryKey: missionControlKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Transition refused by the kernel"),
  });

  const share = useMutation({
    mutationFn: (vars: { missionId: string; visibility: "internal" | "public" }) => setVisibility({ data: vars }),
    onSuccess: (m) => {
      toast.success(m.visibility === "public" ? `${m.name} is now on the public portal` : `${m.name} removed from the public portal`);
      void queryClient.invalidateQueries({ queryKey: missionControlKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not change visibility"),
  });

  return (
    <AppShell eyebrow="Operate" title="Missions">
      <Reveal>
        <SectionHeading
          eyebrow="Create"
          title="Start a mission"
          description="Missions are created through the Mission Kernel and immediately bound to a lifecycle workflow instance."
        />
        <PulseCard>
          {orgs.length === 0 ? (
            <p className="text-sm text-graphite">
              You need an organization first.{" "}
              <Link to="/organizations" className="font-medium text-ink underline underline-offset-4">
                Create one
              </Link>
              .
            </p>
          ) : (
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || !selectedOrg) return;
                create.mutate();
              }}
            >
              <div>
                <Label htmlFor="mission-org">Organization</Label>
                <Select
                  value={selectedOrg?.organization.id ?? ""}
                  onValueChange={setOrganizationId}
                >
                  <SelectTrigger id="mission-org" className="mt-1.5">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.organization.id} value={o.organization.id}>
                        {o.organization.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mission-name">Mission name</Label>
                <Input
                  id="mission-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="2027 General Election"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="mission-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as (typeof MISSION_TYPES)[number])}>
                  <SelectTrigger id="mission-type" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {titleCase(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={create.isPending} className="gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {create.isPending ? "Creating…" : "Create mission"}
                </Button>
              </div>
            </form>
          )}
        </PulseCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading
          eyebrow="Lifecycle"
          title="Run a mission end to end"
          description="Draft → planning → launch (approval) → active → paused/completed → archived. Every step is validated by the Workflow Kernel."
        />
        {isLoading ? (
          <PulseCard>
            <p className="text-sm text-graphite">Loading missions…</p>
          </PulseCard>
        ) : missions.length === 0 ? (
          <PulseCard>
            <p className="text-sm text-graphite">No missions yet. Create your first mission above.</p>
          </PulseCard>
        ) : (
          <div className="space-y-3">
            {missions.map(({ mission, workflow }) => (
              <PulseCard key={mission.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl text-ink">{mission.name}</h3>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_TONE[mission.status])}>
                        {titleCase(mission.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-graphite">
                      {titleCase(mission.type)} · workflow {workflow ? workflow.state : "not started"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={share.isPending}
                      onClick={() =>
                        share.mutate({ missionId: mission.id, visibility: mission.visibility === "public" ? "internal" : "public" })
                      }
                    >
                      {mission.visibility === "public" ? "Unpublish from portal" : "Publish to portal"}
                    </Button>
                    {NEXT_ACTIONS[mission.status].length === 0 ? (
                      <span className="text-xs text-graphite">Lifecycle complete</span>
                    ) : (
                      NEXT_ACTIONS[mission.status].map((action) => (
                        <Button
                          key={action}
                          size="sm"
                          variant={action === "launch" ? "default" : "outline"}
                          disabled={step.isPending}
                          onClick={() => step.mutate({ missionId: mission.id, action })}
                          className="gap-1.5"
                        >
                          {action === "launch" && <Rocket className="h-3.5 w-3.5" aria-hidden="true" />}
                          {ACTION_LABEL[action]}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </PulseCard>
            ))}
          </div>
        )}
      </Reveal>
    </AppShell>
  );
}
