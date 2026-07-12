import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Managed authenticated layout.
 *
 * Any route file under `src/routes/_authenticated/*` is protected by this
 * gate. SSR is disabled because Supabase persists the session in localStorage,
 * which the server cannot read; gating server-side causes hard-refresh loops.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
