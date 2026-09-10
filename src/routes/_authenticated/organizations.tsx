import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { AppShell, PulseCard, SectionHeading, Reveal, StatCard, DashboardGrid } from "@/components/pulse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrganizationWithWorkspace, listWorkspaceOverview } from "@/lib/mission-control.functions";
import { ORG_KINDS, missionControlKey, titleCase } from "@/lib/mission-control";

export const Route = createFileRoute("/_authenticated/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — Pulse Mission Control" },
      { name: "description", content: "Create and manage the organizations and workspaces running your missions in Pulse." },
      { property: "og:title", content: "Organizations — Pulse Mission Control" },
      { property: "og:description", content: "Create and manage the organizations and workspaces running your missions in Pulse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const overview = useServerFn(listWorkspaceOverview);
  const createOrg = useServerFn(createOrganizationWithWorkspace);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: missionControlKey, queryFn: () => overview() });

  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof ORG_KINDS)[number]>("party");
  const [workspaceName, setWorkspaceName] = useState("Headquarters");

  const mutation = useMutation({
    mutationFn: () => createOrg({ data: { name, kind, workspaceName } }),
    onSuccess: (result) => {
      toast.success(`${result.organization.name} created with workspace “${result.workspace.name}”`);
      setName("");
      void queryClient.invalidateQueries({ queryKey: missionControlKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not create organization"),
  });

  const orgs = data?.organizations ?? [];
  const workspaceCount = orgs.reduce((total, o) => total + o.workspaces.length, 0);
  const missionCount = orgs.reduce((total, o) => total + o.missionCount, 0);

  return (
    <AppShell eyebrow="Operate" title="Organizations">
      <Reveal>
        <DashboardGrid>
          <StatCard label="Organizations" value={String(orgs.length)} />
          <StatCard label="Workspaces" value={String(workspaceCount)} />
          <StatCard label="Missions" value={String(missionCount)} />
          <StatCard label="Kernel" value="Live" hint="mission · workflow · data" />
        </DashboardGrid>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading
          eyebrow="Bootstrap"
          title="Create an organization"
          description="Every organization is created through the Mission Kernel and comes with a first workspace."
        />
        <PulseCard>
          <form
            className="grid gap-4 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              mutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Unity Alliance"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="org-kind">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as (typeof ORG_KINDS)[number])}>
                <SelectTrigger id="org-kind" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {titleCase(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ws-name">First workspace</Label>
              <Input
                id="ws-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {mutation.isPending ? "Creating…" : "Create organization"}
              </Button>
            </div>
          </form>
        </PulseCard>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <SectionHeading eyebrow="Registry" title="Your organizations" />
        {isLoading ? (
          <PulseCard>
            <p className="text-sm text-graphite">Loading organizations…</p>
          </PulseCard>
        ) : orgs.length === 0 ? (
          <PulseCard>
            <p className="text-sm text-graphite">No organizations yet. Create your first one above.</p>
          </PulseCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orgs.map(({ organization, workspaces, missionCount: count }) => (
              <PulseCard key={organization.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-graphite" aria-hidden="true" />
                      <h3 className="font-display text-xl text-ink">{organization.name}</h3>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-graphite">
                      {titleCase(organization.kind)} · {organization.slug}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-graphite">
                    {count} mission{count === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="mt-4 space-y-1 text-sm text-graphite">
                  {workspaces.map((ws) => (
                    <li key={ws.id}>· {ws.name}</li>
                  ))}
                </ul>
                <Link
                  to="/campaigns"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                  Run a mission <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </PulseCard>
            ))}
          </div>
        )}
      </Reveal>
    </AppShell>
  );
}
