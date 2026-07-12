# Contributing

## Workflow

1. Pick or create an issue with a clear acceptance criterion.
2. Read the relevant docs: `ENGINEERING_PRINCIPLES.md`,
   `CODING_STANDARDS.md`, `DESIGN_SYSTEM.md`.
3. Implement the smallest change that meets the criterion. If the change
   spans two contexts, split it.
4. Run:
   ```bash
   bun run lint
   bun run build
   ```
5. Update docs if you added a primitive, a domain event, a route or a
   table.
6. Ship a Conventional-Commit-style message:
   `feat(campaigns): add strategy canvas skeleton`.

## Adding a new route

- File under `src/routes/` (public) or `src/routes/_authenticated/`
  (protected).
- Wrap the page in `<AppShell>` for authenticated routes.
- Provide `head()` with a unique `title` and `description`.
- If the route reads data, use TanStack Query + a server fn — never
  `useEffect + fetch`.

## Adding a database table

- Use the migration tool. In the SAME migration:
  1. `CREATE TABLE public.<name>(...)`
  2. `GRANT` to the roles your policies allow
  3. `ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY`
  4. `CREATE POLICY ...`
- Roles live in `user_roles`, never on `profiles`.

## Adding a design primitive

- Live in `src/components/pulse/`.
- Export from `src/components/pulse/index.ts`.
- Document in `docs/DESIGN_SYSTEM.md`.
- Refactor two existing usages in the same PR.

## Definition of done

- Loading, error and empty states are present.
- Keyboard-navigable, focus-visible.
- No hardcoded colors, no `any`, no `console.log` (`console.info/warn/error` OK).
- Docs updated.
- Build passes.
