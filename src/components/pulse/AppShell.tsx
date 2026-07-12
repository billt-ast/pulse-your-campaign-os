import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  Users,
  Building2,
  Map as MapIcon,
  BookOpen,
  Bell,
  BarChart3,
  Search,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { motion as motionTokens } from "./tokens";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Activity;
  group: "operate" | "intelligence" | "governance";
};

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Mission Control", icon: Home, group: "operate" },
  { to: "/campaigns", label: "Campaigns", icon: Activity, group: "operate" },
  { to: "/organizations", label: "Organizations", icon: Building2, group: "operate" },
  { to: "/identity", label: "People & Identity", icon: Users, group: "operate" },
  { to: "/gis", label: "Geospatial", icon: MapIcon, group: "intelligence" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "intelligence" },
  { to: "/ai", label: "Pulse AI", icon: Sparkles, group: "intelligence" },
  { to: "/search", label: "Search", icon: Search, group: "intelligence" },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen, group: "governance" },
  { to: "/media", label: "Media", icon: ImageIcon, group: "governance" },
  { to: "/notifications", label: "Notifications", icon: Bell, group: "governance" },
  { to: "/audit", label: "Audit", icon: ShieldCheck, group: "governance" },
];

const GROUP_LABEL: Record<NavItem["group"], string> = {
  operate: "Operate",
  intelligence: "Intelligence",
  governance: "Governance",
};

export function AppShell({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.005_85)] text-foreground">
      {/* Sidebar — desktop */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-hairline bg-paper lg:flex"
        aria-label="Primary navigation"
      >
        <SidebarInner pathname={pathname} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.entrance }}
            className="absolute inset-y-0 left-0 w-[280px] border-r border-hairline bg-paper"
          >
            <SidebarInner
              pathname={pathname}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileOpen(false)}
            />
          </motion.aside>
        </div>
      )}

      {/* Main pane */}
      <div className="lg:pl-[264px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-hairline bg-paper/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-hairline text-ink lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-[11px] uppercase tracking-[0.18em] text-graphite">{eyebrow}</p>
                )}
                <h1 className="truncate font-display text-2xl leading-tight text-ink">{title}</h1>
              </div>
            </div>
            {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main id="main-content" className="px-4 pb-24 pt-8 md:px-8">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  pathname,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  const groups: NavItem["group"][] = ["operate", "intelligence", "governance"];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-paper">
            <span className="h-2 w-2 rounded-full bg-civic-soft" />
          </span>
          <span className="font-display text-xl text-ink">Pulse</span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-graphite lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g} className="mb-5">
            <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-graphite">
              {GROUP_LABEL[g]}
            </p>
            <ul className="space-y-0.5">
              {NAV.filter((n) => n.group === g).map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-ink text-paper"
                          : "text-ink hover:bg-secondary hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-civic-soft" : "text-graphite group-hover:text-ink",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-hairline p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-secondary"
        >
          <LogOut className="h-4 w-4 text-graphite" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
