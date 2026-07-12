import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/organizations")({
  head: () => ({ meta: [{ title: "Organizations — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Operate" title="Organizations">
      <ComingSoon
        title="Organizations & workspaces"
        description="Multi-tenant structure, member management, roles, permissions and organizational hierarchies."
        bullets={["Tenants & workspaces", "Members & invitations", "Roles & permissions", "Structure & hierarchy"]}
      />
    </AppShell>
  ),
});
