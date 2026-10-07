import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Target, AlertTriangle, Gauge, Plus } from "lucide-react";
import { AppShell, PulseCard, SectionHeading, Reveal } from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createMissionWithWorkflow,
  generateMissionPlanFn,
  listWorkspaceOverview,
} from "@/lib/mission-control.functions";
import { MISSION_TYPES, missionControlKey, titleCase } from "@/lib/mission-control";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "AI Mission Planner — Pulse" },
      { name: "description", content: "Turn a campaign brief into a structured mission plan with objectives, phases, tasks, risks and KPIs." },
      { property: "og:title", content: "AI Mission Planner — Pulse" },
      { property: "og:description", content: "Turn a campaign brief into a structured mission plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const PRIORITY_TONE: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-[oklch(0.94_0.08_75)] text-[oklch(0.4_0.09_60)]",
  normal: "bg-secondary text-ink",
  low: "bg-secondary text-graphite",
};

function PlannerPage() {
  const overview = useServerFn(listWorkspaceOverview);
  const generate = useServerFn(generateMissionPlanFn);
  const createMission = useServerFn(createMissionWithWorkflow);
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: missionControlKey, queryFn: () => overview() });
  const orgs = data?.organizations ?? [];

  const [brief, setBrief] = useState("");
  const [missionType, setMissionType] = useState<(typeof MISSION_TYPES)[number]>("campaign");
  const [organizationId, setOrganizationId] = useState<string>("");
  const orgId = organizationId || orgs[0]?.organization.id || "";

  const plan = useMutation({
    mutationFn: () => generate({ data: { brief, missionType, organizationId: orgId || null } }),
    onSuccess: (r) => {
      if (!r.ok) toast.error(r.error);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate a plan"),
  });
  const result = plan.data?.ok ? plan.data.plan : null;

  const save = useMutation({
    mutationFn: () => {
      const org = orgs.find((o) => o.organization.id === orgId)!;
      return createMission({
        data: { organizationId: org.organization.id, workspaceId: org.workspaces[0]?.id ?? null, name: result!.title, type: missionType },
      });
    },
    onSuccess: (row) => {
      toast.success(`“${row.mission.name}” created as a draft mission`);
      void queryClient.invalidateQueries({ queryKey: missionControlKey });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create mission"),
  });

  return (
    <AppShell eyebrow="Intelligence" title="AI Mission Planner">
      <Reveal>
        <SectionHeading
          eyebrow="Brief"
          title="Describe your campaign"
          description="Share goals, geography, timeline, audience and constraints. Pulse AI drafts a structured mission plan you can turn into a live mission."
        />
        <PulseCard>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (brief.trim().length < 20) return toast.error("Please write at least a couple of sentences.");
              plan.mutate();
            }}
          >
            <div>
              <Label htmlFor="brief">Campaign brief</Label>
              <Textarea
                id="brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={7}
                maxLength={8000}
                placeholder="e.g. Win the Nairobi governor seat in August 2027. Focus on youth turnout in Eastlands, 12-month runway, 400 volunteers, budget of KES 80M…"
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="ptype">Mission type</Label>
                <Select value={missionType} onValueChange={(v) => setMissionType(v as (typeof MISSION_TYPES)[number])}>
                  <SelectTrigger id="ptype" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map((t) => <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {orgs.length > 0 && (
                <div>
                  <Label htmlFor="porg">Organization</Label>
                  <Select value={orgId} onValueChange={setOrganizationId}>
                    <SelectTrigger id="porg" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {orgs.map((o) => <SelectItem key={o.organization.id} value={o.organization.id}>{o.organization.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button type="submit" disabled={plan.isPending} className="gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {plan.isPending ? "Drafting plan… (this can take a minute)" : "Generate mission plan"}
            </Button>
          </form>
        </PulseCard>
      </Reveal>

      {result && (
        <Reveal className="mt-8">
          <SectionHeading
            eyebrow="Draft plan"
            title={result.title}
            description={result.summary}
            actions={
              orgs.length > 0 ? (
                <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" /> {save.isPending ? "Creating…" : "Create mission"}
                </Button>
              ) : (
                <Link to="/organizations" className="text-sm font-medium text-ink underline underline-offset-4">Create an organization to save</Link>
              )
            }
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <PulseCard>
              <h3 className="flex items-center gap-2 font-display text-lg text-ink"><Target className="h-4 w-4" aria-hidden="true" /> Objectives</h3>
              <ul className="mt-3 space-y-3">
                {result.objectives.map((o, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-medium text-ink">{o.name}</p>
                    <p className="text-graphite">{o.metric} · target {o.target}</p>
                  </li>
                ))}
              </ul>
            </PulseCard>
            <PulseCard>
              <h3 className="flex items-center gap-2 font-display text-lg text-ink"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Risks</h3>
              <ul className="mt-3 space-y-3">
                {result.risks.map((r, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-medium text-ink">{r.risk}</p>
                    <p className="text-graphite">{r.mitigation}</p>
                  </li>
                ))}
              </ul>
            </PulseCard>
            <PulseCard>
              <h3 className="flex items-center gap-2 font-display text-lg text-ink"><Gauge className="h-4 w-4" aria-hidden="true" /> KPIs</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-ink">
                {result.kpis.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </PulseCard>
          </div>

          <div className="mt-6 space-y-4">
            {result.phases.map((phase, i) => (
              <PulseCard key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl text-ink">
                    <span className="mr-2 text-graphite">{String(i + 1).padStart(2, "0")}</span>{phase.name}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-graphite">{phase.duration}</span>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-graphite">
                  {phase.goals.map((g, j) => <li key={j}>{g}</li>)}
                </ul>
                <ul className="mt-4 divide-y divide-hairline">
                  {phase.tasks.map((t, j) => (
                    <li key={j} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="text-ink">{t.title}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-graphite">{t.owner}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_TONE[t.priority] ?? ""}`}>{t.priority}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </PulseCard>
            ))}
          </div>
        </Reveal>
      )}
    </AppShell>
  );
}
