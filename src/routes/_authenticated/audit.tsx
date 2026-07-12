import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Governance" title="Audit & Security">
      <ComingSoon
        title="Audit log & security posture"
        description="Every privileged action, every access grant, every data change — captured as an append-only stream for zero-trust compliance."
        bullets={["Immutable audit stream", "Access reviews", "Anomaly detection", "Compliance exports"]}
      />
    </AppShell>
  ),
});
