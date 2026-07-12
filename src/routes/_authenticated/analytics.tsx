import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ChartFrame, PanelFrame, DashboardGrid, StatCard, Reveal } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Intelligence" title="Analytics">
      <Reveal>
        <DashboardGrid>
          <StatCard label="Events tracked" value="—" hint="awaiting data" />
          <StatCard label="Reports" value="—" hint="awaiting data" />
          <StatCard label="Dashboards" value="—" hint="awaiting data" />
          <StatCard label="Exports" value="—" hint="awaiting data" />
        </DashboardGrid>
      </Reveal>
      <Reveal delay={0.05} className="mt-8 grid gap-4 lg:grid-cols-2">
        <PanelFrame title="Engagement trend"><ChartFrame label="Engagement" /></PanelFrame>
        <PanelFrame title="Signal quality"><ChartFrame label="Signal" /></PanelFrame>
      </Reveal>
    </AppShell>
  ),
});
