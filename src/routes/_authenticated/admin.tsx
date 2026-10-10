import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppShell, DashboardGrid, PulseCard, Reveal, SectionHeading, StatCard } from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MEMBER_ROLES,
  adminAddMember,
  adminCreateOrganization,
  adminCreateUser,
  adminCreateWorkspace,
  adminRemoveMember,
  getAdminOverview,
} from "@/lib/admin.functions";
import { ORG_KINDS, missionControlKey, titleCase } from "@/lib/mission-control";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Pulse" },
      { name: "description", content: "Create organizations, workspaces and users, and manage who shares access to missions." },
      { property: "og:title", content: "Admin Console — Pulse" },
      { property: "og:description", content: "Manage organizations, workspaces, users and shared mission access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Role = (typeof MEMBER_ROLES)[number];
const adminKey = ["admin", "overview"] as const;

function AdminPage() {
  const overview = useServerFn(getAdminOverview);
  const createOrg = useServerFn(adminCreateOrganization);
  const createWs = useServerFn(adminCreateWorkspace);
  const createUser = useServerFn(adminCreateUser);
  const addMember = useServerFn(adminAddMember);
  const removeMember = useServerFn(adminRemoveMember);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: adminKey, queryFn: () => overview(), retry: false });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: adminKey });
    void qc.invalidateQueries({ queryKey: missionControlKey });
  };
  const onErr = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

  const [orgName, setOrgName] = useState("");
  const [orgKind, setOrgKind] = useState<(typeof ORG_KINDS)[number]>("party");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userOrg, setUserOrg] = useState("none");
  const [userRole, setUserRole] = useState<Role>("member");

  const orgM = useMutation({
    mutationFn: () => createOrg({ data: { name: orgName, kind: orgKind } }),
    onSuccess: (o) => { toast.success(`${o.name} created`); setOrgName(""); refresh(); },
    onError: onErr,
  });
  const userM = useMutation({
    mutationFn: () =>
      createUser({ data: { email: userEmail, password: userPassword, organizationId: userOrg === "none" ? null : userOrg, role: userRole } }),
    onSuccess: (u) => { toast.success(`${u.email} can now sign in`); setUserEmail(""); setUserPassword(""); refresh(); },
    onError: onErr,
  });
  const wsM = useMutation({
    mutationFn: (v: { organizationId: string; name: string }) => createWs({ data: v }),
    onSuccess: () => { toast.success("Workspace created"); refresh(); },
    onError: onErr,
  });
  const memberM = useMutation({
    mutationFn: (v: { organizationId: string; userId: string; role: Role }) => addMember({ data: v }),
    onSuccess: () => { toast.success("Access granted"); refresh(); },
    onError: onErr,
  });
  const removeM = useMutation({
    mutationFn: (membershipId: string) => removeMember({ data: { membershipId } }),
    onSuccess: () => { toast.success("Access removed"); refresh(); },
    onError: onErr,
  });

  if (error) {
    return (
      <AppShell eyebrow="Super admin" title="Admin Console">
        <PulseCard><p className="text-sm text-graphite">Only platform admins can use the Admin Console.</p></PulseCard>
      </AppShell>
    );
  }

  const users = data?.users ?? [];
  const orgs = data?.organizations ?? [];

  return (
    <AppShell eyebrow="Super admin" title="Admin Console">
      <Reveal>
        <DashboardGrid>
          <StatCard label="Organizations" value={isLoading ? "—" : String(orgs.length)} />
          <StatCard label="Workspaces" value={isLoading ? "—" : String(orgs.reduce((n, o) => n + o.workspaces.length, 0))} />
          <StatCard label="Users" value={isLoading ? "—" : String(users.length)} />
          <StatCard label="Memberships" value={isLoading ? "—" : String(orgs.reduce((n, o) => n + o.members.length, 0))} />
        </DashboardGrid>
      </Reveal>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <PulseCard>
          <h2 className="font-display text-xl text-ink">New organization</h2>
          <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (orgName.trim()) orgM.mutate(); }}>
            <div><Label htmlFor="a-org">Name</Label><Input id="a-org" value={orgName} onChange={(e) => setOrgName(e.target.value)} required className="mt-1.5" /></div>
            <div>
              <Label htmlFor="a-kind">Kind</Label>
              <Select value={orgKind} onValueChange={(v) => setOrgKind(v as (typeof ORG_KINDS)[number])}>
                <SelectTrigger id="a-kind" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{ORG_KINDS.map((k) => <SelectItem key={k} value={k}>{titleCase(k)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={orgM.isPending}>{orgM.isPending ? "Creating…" : "Create organization"}</Button>
          </form>
        </PulseCard>

        <PulseCard>
          <h2 className="font-display text-xl text-ink">New user</h2>
          <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); userM.mutate(); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="a-email">Email</Label><Input id="a-email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required className="mt-1.5" /></div>
              <div><Label htmlFor="a-pw">Temporary password</Label><Input id="a-pw" type="password" minLength={8} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required className="mt-1.5" /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="a-uorg">Organization</Label>
                <Select value={userOrg} onValueChange={setUserOrg}>
                  <SelectTrigger id="a-uorg" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None yet</SelectItem>
                    {orgs.map((o) => <SelectItem key={o.organization.id} value={o.organization.id}>{o.organization.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <RoleSelect id="a-urole" value={userRole} onChange={setUserRole} />
            </div>
            <Button type="submit" disabled={userM.isPending}>{userM.isPending ? "Creating…" : "Create user"}</Button>
          </form>
        </PulseCard>
      </div>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading eyebrow="Tenancy" title="Organizations, workspaces & access" description="Members of an organization share access to all of its missions." />
        {isLoading ? (
          <PulseCard><p className="text-sm text-graphite">Loading…</p></PulseCard>
        ) : orgs.length === 0 ? (
          <PulseCard><p className="text-sm text-graphite">No organizations yet.</p></PulseCard>
        ) : (
          <div className="space-y-4">
            {orgs.map((o) => (
              <OrgCard
                key={o.organization.id}
                org={o}
                users={users}
                busy={wsM.isPending || memberM.isPending || removeM.isPending}
                onAddWorkspace={(name) => wsM.mutate({ organizationId: o.organization.id, name })}
                onAddMember={(userId, role) => memberM.mutate({ organizationId: o.organization.id, userId, role })}
                onRemove={(id) => removeM.mutate(id)}
              />
            ))}
          </div>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <SectionHeading eyebrow="Identity" title="Users" />
        <PulseCard className="p-0">
          <ul className="divide-y divide-hairline">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <span className="text-ink">{u.email}</span>
                <span className="text-xs text-graphite">{u.isAdmin ? "Platform admin · " : ""}joined {new Date(u.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </PulseCard>
      </Reveal>
    </AppShell>
  );
}

function RoleSelect({ id, value, onChange }: { id: string; value: Role; onChange: (r: Role) => void }) {
  return (
    <div>
      <Label htmlFor={id}>Role</Label>
      <Select value={value} onValueChange={(v) => onChange(v as Role)}>
        <SelectTrigger id={id} className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>{MEMBER_ROLES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function OrgCard({
  org, users, busy, onAddWorkspace, onAddMember, onRemove,
}: {
  org: Awaited<ReturnType<typeof getAdminOverview>>["organizations"][number];
  users: Awaited<ReturnType<typeof getAdminOverview>>["users"];
  busy: boolean;
  onAddWorkspace: (name: string) => void;
  onAddMember: (userId: string, role: Role) => void;
  onRemove: (membershipId: string) => void;
}) {
  const [ws, setWs] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("member");
  const candidates = users.filter((u) => !org.members.some((m) => m.userId === u.id));

  return (
    <PulseCard>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl text-ink">{org.organization.name}</h3>
        <span className="text-xs uppercase tracking-[0.16em] text-graphite">{titleCase(org.organization.kind)}</span>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">Workspaces</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">{org.workspaces.map((w) => <li key={w.id}>· {w.name}</li>)}</ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (ws.trim()) { onAddWorkspace(ws); setWs(""); } }}>
            <Input aria-label="New workspace name" placeholder="New workspace" value={ws} onChange={(e) => setWs(e.target.value)} />
            <Button type="submit" variant="outline" disabled={busy}>Add</Button>
          </form>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">Members</p>
          <ul className="mt-2 space-y-1 text-sm">
            {org.members.length === 0 && <li className="text-graphite">No members yet</li>}
            {org.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <span className="text-ink">{m.email} <span className="text-graphite">· {m.role}</span></span>
                <button type="button" aria-label={`Remove ${m.email}`} onClick={() => onRemove(m.id)} className="text-graphite hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {candidates.length > 0 && (
            <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (userId) { onAddMember(userId, role); setUserId(""); } }}>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger aria-label="User to add" className="w-48"><SelectValue placeholder="Add user…" /></SelectTrigger>
                <SelectContent>{candidates.map((u) => <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger aria-label="Role" className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{MEMBER_ROLES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" variant="outline" disabled={busy || !userId}>Grant</Button>
            </form>
          )}
        </div>
      </div>
    </PulseCard>
  );
}
