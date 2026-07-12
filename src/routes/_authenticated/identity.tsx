import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/identity")({
  head: () => ({ meta: [{ title: "People & Identity — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Operate" title="People & Identity">
      <ComingSoon
        title="Unified identity graph"
        description="Contacts, staff, volunteers, donors and constituents as a single addressable identity graph."
        bullets={["Person records", "Cohorts & segments", "Role assignments", "Consent & privacy"]}
      />
    </AppShell>
  ),
});
