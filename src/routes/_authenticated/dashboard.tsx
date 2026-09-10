import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AppShell,
  SectionHeading,
  StatCard,
  DashboardGrid,
  PanelFrame,
  PulseCard,
  Reveal,
} from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { listWorkspaceOverview } from "@/lib/mission-control.functions";
import { STATUS_TONE, missionControlKey, titleCase } from "@/lib/mission-control";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Mission Control — Pulse" },
      { name: "description", content: "Live overview of your organizations, workspaces and missions running on the Pulse kernel." },
      { property: "og:title", content: "Mission Control — Pulse" },
      { property: "og:description", content: "Live overview of your organizations, workspaces and missions running on the Pulse kernel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const overview = useServerFn(listWorkspaceOverview);
  const { data, isLoading } = useQuery({ queryKey: missionControlKey, queryFn: () => overview() });

  const orgs = data?.organizations ?? [];
  const missions = data?.missions ?? [];
  const active = missions.filter((m) => m.mission.status === "active").length;
  const inFlight = missions.filter((m) => ["draft", "planning"].includes(m.mission.status)).length;
  const workspaces = orgs.reduce((total, o) => total + o.workspaces.length, 0);

  return (
    <AppShell
      eyebrow="Overview"
      title="Mission Control"
      actions={
        <Button asChild className="gap-2">
          <Link to="/campaigns">
            <Plus className="h-4 w-4" aria-hidden="true" /> New mission
          </Link>
        </Button>
      }
    >
      <Reveal>
        <DashboardGrid>
          <StatCard label="Organizations" value={isLoading ? "—" : String(orgs.length)} />
          <StatCard label="Workspaces" value={isLoading ? "—" : String(workspaces)} />
          <StatCard label="Active missions" value={isLoading ? "—" : String(active)} hint="status: active" />
          <StatCard label="In preparation" value={isLoading ? "—" : String(inFlight)} hint="draft & planning" />
        </DashboardGrid>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading
          eyebrow="Live"
          title="Recent missions"
          description="Everything here is read and written through the Pulse kernel — mission, workflow, event and data."
        />
        {isLoading ? (
          <PulseCard>
            <p className="text-sm text-graphite">Loading your workspace…</p>
          </PulseCard>
        ) : missions.length === 0 ? (
          <PulseCard>
            <p className="text-sm text-graphite">
              No missions yet.{" "}
              <Link to="/organizations" className="font-medium text-ink underline underline-offset-4">
                Create an organization
              </Link>{" "}
              then start your first mission.
            </p>
          </PulseCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PanelFrame title="Mission lifecycle" description="Latest missions and workflow state">
                <ul className="divide-y divide-hairline">
                  {missions.slice(0, 6).map(({ mission, workflow }) => (
                    <li key={mission.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{mission.name}</p>
                        <p className="text-xs text-graphite">
                          {titleCase(mission.type)} · workflow {workflow ? workflow.state : "not started"}
                        </p>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_TONE[mission.status])}>
                        {titleCase(mission.status)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/campaigns"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                  Open missions <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </PanelFrame>
            </div>
            <PanelFrame title="Organizations" description="Tenants you can operate">
              <ul className="space-y-3">
                {orgs.map(({ organization, workspaces: ws, missionCount }) => (
                  <li key={organization.id}>
                    <p className="text-sm font-medium text-ink">{organization.name}</p>
                    <p className="text-xs text-graphite">
                      {ws.length} workspace{ws.length === 1 ? "" : "s"} · {missionCount} mission
                      {missionCount === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            </PanelFrame>
          </div>
        )}
      </Reveal>
    </AppShell>
  );
}
