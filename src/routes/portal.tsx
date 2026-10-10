import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicMissions } from "@/lib/portal.functions";
import { titleCase } from "@/lib/mission-control";
import { cn } from "@/lib/utils";

const STAGES = ["draft", "planning", "active", "completed"] as const;

const portalQuery = queryOptions({ queryKey: ["portal", "missions"], queryFn: () => listPublicMissions() });

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Public Mission Portal — Pulse" },
      { name: "description", content: "Follow public campaign missions and see which stage each one is in — no sign-in needed." },
      { property: "og:title", content: "Public Mission Portal — Pulse" },
      { property: "og:description", content: "Follow public campaign missions and their stages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  errorComponent: () => <p className="p-10 text-sm text-graphite">The portal is unavailable right now.</p>,
  notFoundComponent: () => <p className="p-10 text-sm text-graphite">Not found.</p>,
  component: PortalPage,
});

function stageIndex(status: string) {
  if (status === "paused") return 2;
  if (status === "archived") return 3;
  return Math.max(0, STAGES.indexOf(status as (typeof STAGES)[number]));
}

function PortalPage() {
  const { data: missions } = useSuspenseQuery(portalQuery);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-paper"><span className="h-2 w-2 rounded-full bg-civic-soft" /></span>
            <span className="font-display text-xl">Pulse</span>
          </Link>
          <Link to="/auth" className="text-sm font-medium underline-offset-4 hover:underline">Member sign in</Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-[11px] uppercase tracking-[0.2em] text-graphite">Public portal</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Missions in motion</h1>
        <p className="mt-3 max-w-2xl text-graphite">Every mission an organization chooses to share, and the stage it has reached.</p>

        {missions.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-hairline p-6 text-sm text-graphite">No public missions yet.</p>
        ) : (
          <ul className="mt-10 space-y-4">
            {missions.map((m) => {
              const at = stageIndex(m.status);
              return (
                <li key={m.id} className="rounded-2xl border border-hairline bg-card p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-2xl">{m.name}</h2>
                    <span className="text-xs uppercase tracking-[0.16em] text-graphite">
                      {m.organization ?? "—"} · {titleCase(m.type)}
                    </span>
                  </div>
                  {m.summary && <p className="mt-2 text-sm text-graphite">{m.summary}</p>}
                  <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Mission stages">
                    {STAGES.map((s, i) => (
                      <li key={s} aria-current={i === at ? "step" : undefined}>
                        <div className={cn("h-1.5 rounded-full", i <= at ? "bg-navy" : "bg-secondary")} />
                        <p className={cn("mt-2 text-xs", i === at ? "font-medium text-ink" : "text-graphite")}>
                          {i === at && m.status === "paused" ? "Paused" : i === at && m.status === "archived" ? "Archived" : titleCase(s)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
