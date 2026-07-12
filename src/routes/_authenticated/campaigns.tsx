import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Operate" title="Campaigns">
      <ComingSoon
        title="Campaign lifecycle workspace"
        description="Plan, run and retrospect every campaign — from strategy through election day and governance handoff."
        bullets={[
          "Strategy canvas & milestones",
          "Field operations calendar",
          "Volunteer & event coordination",
          "Election-day command center",
        ]}
      />
    </AppShell>
  ),
});
