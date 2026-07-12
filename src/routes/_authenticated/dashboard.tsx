import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  SectionHeading,
  StatCard,
  DashboardGrid,
  PanelFrame,
  ChartFrame,
  MapFrame,
  Reveal,
  ComingSoon,
} from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Mission Control — Pulse" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell
      eyebrow="Overview"
      title="Mission Control"
      actions={
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" /> Ask Pulse AI
        </Button>
      }
    >
      <Reveal>
        <DashboardGrid>
          <StatCard label="Active campaigns" value="12" delta={{ value: "+2 this week", direction: "up" }} />
          <StatCard label="Volunteers engaged" value="4,821" delta={{ value: "+318", direction: "up" }} />
          <StatCard label="Signal quality" value="94.2" delta={{ value: "steady", direction: "flat" }} hint="pulse score" />
          <StatCard label="Open incidents" value="3" delta={{ value: "-1", direction: "down" }} />
        </DashboardGrid>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading
          eyebrow="Live"
          title="Situation map"
          description="Real-time geospatial view of every field operation, event and signal across the organization."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PanelFrame title="Field operations" description="All active regions">
              <MapFrame label="Operations layer" />
            </PanelFrame>
          </div>
          <PanelFrame title="Pulse score trend" description="Rolling 30-day signal">
            <ChartFrame label="Signal quality" />
          </PanelFrame>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <ComingSoon
          title="Modules ready to activate"
          description="Every core module is scaffolded, typed and wired into the design system. Business logic is intentionally deferred until Phase 2B.1.2."
          bullets={[
            "Campaigns · Planning, calendar, milestones",
            "Organizations · Structure, members, permissions",
            "People & Identity · Contacts, roles, cohorts",
            "Geospatial · Map layers, catchments, boundaries",
            "Analytics · Dashboards, KPIs, exports",
            "Pulse AI · Agents, prompts, briefings",
            "Knowledge · Docs, decisions, playbooks",
            "Audit · Actions, security, compliance",
          ]}
        />
      </Reveal>
    </AppShell>
  );
}
