/** Public portal reads — no sign-in. Uses the publishable key; RLS only exposes public missions. */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface PublicMission {
  id: string;
  name: string;
  type: string;
  status: string;
  summary: string | null;
  updatedAt: string;
  organization: string | null;
}

export const listPublicMissions = createServerFn({ method: "GET" }).handler(async (): Promise<PublicMission[]> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data: missions, error } = await client
    .from("missions")
    .select("id, name, type, status, summary, updated_at, organization_id")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("portal missions", error.message);
    return [];
  }
  const orgIds = [...new Set((missions ?? []).map((m) => m.organization_id))];
  const { data: orgs } = orgIds.length
    ? await client.from("organizations").select("id, name").in("id", orgIds)
    : { data: [] as { id: string; name: string }[] };
  const nameOf = new Map((orgs ?? []).map((o) => [o.id, o.name]));
  return (missions ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    status: m.status,
    summary: m.summary,
    updatedAt: m.updated_at,
    organization: nameOf.get(m.organization_id) ?? null,
  }));
});
