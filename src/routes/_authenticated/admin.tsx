import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon, DashboardGrid, StatCard, Reveal } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Super admin" title="Admin Console">
      <Reveal>
        <DashboardGrid>
          <StatCard label="Tenants" value="—" hint="platform" />
          <StatCard label="Users" value="—" hint="platform" />
          <StatCard label="Storage" value="—" hint="platform" />
          <StatCard label="Incidents" value="0" hint="last 24h" />
        </DashboardGrid>
      </Reveal>
      <Reveal delay={0.05} className="mt-8">
        <ComingSoon
          title="Platform administration"
          description="Cross-tenant admin surface for Pulse operators — tenant management, feature flags, service health and platform observability."
          bullets={["Tenant management", "Feature flags", "Service health", "Platform observability"]}
        />
      </Reveal>
    </AppShell>
  ),
});
