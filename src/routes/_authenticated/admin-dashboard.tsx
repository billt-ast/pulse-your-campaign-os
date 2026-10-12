import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, DashboardGrid, PulseCard, Reveal, SectionHeading, StatCard } from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin.functions";
import { titleCase } from "@/lib/mission-control";

export const Route = createFileRoute("/_authenticated/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pulse" },
      { name: "description", content: "Live counts of organizations, workspaces and users across Pulse." },
      { property: "og:title", content: "Admin Dashboard — Pulse" },
      { property: "og:description", content: "Live platform overview of organizations, workspaces and users." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const overview = useServerFn(getAdminOverview);
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => overview(),
    retry: false,
    refetchInterval: 15000,
  });

  if (error) {
    return (
      <AppShell eyebrow="Super admin" title="Admin Dashboard">
        <PulseCard><p className="text-sm text-graphite">Only platform admins can view this dashboard.</p></PulseCard>
      </AppShell>
    );
  }

  const users = data?.users ?? [];
  const orgs = data?.organizations ?? [];
  const workspaces = orgs.flatMap((o) => o.workspaces.map((w) => ({ ...w, orgName: o.organization.name })));
  const memberships = orgs.reduce((n, o) => n + o.members.length, 0);
  const orgCount = new Map<string, number>();
  orgs.forEach((o) => o.members.forEach((m) => orgCount.set(m.userId, (orgCount.get(m.userId) ?? 0) + 1)));
  const v = (n: number) => (isLoading ? "—" : String(n));

  return (
    <AppShell eyebrow="Super admin" title="Admin Dashboard">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-graphite">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden />
          Live · refreshes every 15s{dataUpdatedAt ? ` · updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ""}
        </p>
        <Button asChild variant="outline"><Link to="/admin">Open Admin Console</Link></Button>
      </div>

      <Reveal>
        <DashboardGrid>
          <StatCard label="Organizations" value={v(orgs.length)} />
          <StatCard label="Workspaces" value={v(workspaces.length)} />
          <StatCard label="Users" value={v(users.length)} />
          <StatCard label="Memberships" value={v(memberships)} />
        </DashboardGrid>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading eyebrow="Tenancy" title="Organizations" />
        <PulseCard className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-graphite">
              <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Kind</th><th className="px-6 py-3">Workspaces</th><th className="px-6 py-3">Members</th></tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orgs.map((o) => (
                <tr key={o.organization.id}>
                  <td className="px-6 py-3 text-ink">{o.organization.name}</td>
                  <td className="px-6 py-3 text-graphite">{titleCase(o.organization.kind)}</td>
                  <td className="px-6 py-3 text-ink">{o.workspaces.length}</td>
                  <td className="px-6 py-3 text-ink">{o.members.length}</td>
                </tr>
              ))}
              {!isLoading && orgs.length === 0 && <tr><td colSpan={4} className="px-6 py-3 text-graphite">No organizations yet.</td></tr>}
            </tbody>
          </table>
        </PulseCard>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.1}>
          <SectionHeading eyebrow="Spaces" title="Workspaces" />
          <PulseCard className="p-0">
            <ul className="divide-y divide-hairline">
              {workspaces.map((w) => (
                <li key={w.id} className="flex justify-between gap-3 px-6 py-3 text-sm">
                  <span className="text-ink">{w.name}</span><span className="text-graphite">{w.orgName}</span>
                </li>
              ))}
              {!isLoading && workspaces.length === 0 && <li className="px-6 py-3 text-sm text-graphite">No workspaces yet.</li>}
            </ul>
          </PulseCard>
        </Reveal>
        <Reveal delay={0.15}>
          <SectionHeading eyebrow="Identity" title="Users" />
          <PulseCard className="p-0">
            <ul className="divide-y divide-hairline">
              {users.map((u) => (
                <li key={u.id} className="flex justify-between gap-3 px-6 py-3 text-sm">
                  <span className="text-ink">{u.email}</span>
                  <span className="text-graphite">{u.isAdmin ? "Admin · " : ""}{orgCount.get(u.id) ?? 0} orgs</span>
                </li>
              ))}
            </ul>
          </PulseCard>
        </Reveal>
      </div>
    </AppShell>
  );
}
