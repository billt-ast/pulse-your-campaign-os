# Engineering Principles

The twelve build principles from the Pulse constitution, translated into
concrete engineering rules that apply to every commit.

1. **Architecture before features** — Introduce the module boundary before
   the first component that lives in it.
2. **Everything is modular** — Each bounded context has its own route folder;
   components import UP (into shared primitives) never SIDEWAYS.
3. **Everything is reusable** — If a piece of UI is used twice, extract it
   to `src/components/pulse/` before the third use.
4. **Everything is documented** — Public server fns, exported components and
   database tables ship with a `/**` block explaining intent, not mechanics.
5. **Everything is typed** — `strict: true`. No `any`. Route params, search,
   loader data and Supabase rows all flow through inferred types.
6. **Everything is observable** — Structured `console.info/warn/error`. All
   server-fn errors surface through the root error boundary reporter.
7. **Everything is testable** — Pure functions live in `src/lib/`. UI logic
   is separated from presentation so unit tests can target it directly.
8. **Everything is versioned** — Schema changes ship as ordered migrations,
   never ad-hoc SQL. UI tokens live in `styles.css`, not in components.
9. **Everything is event-driven** — Consequential state changes emit domain
   events consumed by the notifications, analytics and audit contexts.
10. **Everything is context-aware** — Every read is scoped to the tenant,
    the user and the surrounding entity. Never trust the client for scope.
11. **Everything is geographically aware** — Location-bearing entities carry
    lat/lng or PostGIS geometry from day one.
12. **Every component is production-ready** — Loading, error and empty states
    are part of the component's first version, not a follow-up.

## Additional non-negotiables

- **RLS-first**: A new `public` table without RLS + GRANT is a build failure.
- **Server-only secrets**: `process.env.*` is only touched inside a
  `createServerFn` handler or a server-only helper.
- **Design system compliance**: Authenticated pages MUST use `AppShell` +
  Pulse primitives — no hand-rolled shells or one-off colors.
- **Public-route safety**: Public loaders never call `requireSupabaseAuth`.
- **Motion budget**: Cinematic transitions on landing; restrained, short
  reveals inside Mission Control.
