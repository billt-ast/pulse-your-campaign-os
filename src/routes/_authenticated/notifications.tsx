import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Governance" title="Notifications">
      <ComingSoon
        title="Event-driven notifications"
        description="Every consequential platform event fans out through the notification service — in-app, email and webhook channels."
        bullets={["In-app inbox", "Email digests", "Webhooks", "Per-user preferences"]}
      />
    </AppShell>
  ),
});
