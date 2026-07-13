# Engineering Guidelines

These guidelines apply to every commit in the Pulse repository. They
extend [ENGINEERING_PRINCIPLES.md](./ENGINEERING_PRINCIPLES.md) with the
concrete workflow expectations for multi-team contribution.

## Module boundaries

- Every unit of shared code lives under `src/packages/*`, `src/services/*`,
  `src/libs/*`, or `src/workers/*` (see [MONOREPO_MAPPING.md](./MONOREPO_MAPPING.md)).
- Route files (`src/routes/*`) are composition-only: they arrange
  primitives from `packages/*` and call server fns from `services/*`.
- Cross-service communication is event-based (`libs/events`), never a
  direct import.

## TypeScript

- `strict: true`. No `any`, no non-null `!` on values you didn't create in
  the same function. Prefer discriminated unions over booleans-with-context.
- All exported functions and components carry a `/**` block that explains
  intent, invariants, and (for server fns) auth model.
- Zod schemas in `packages/validators` are the source of truth for request
  and event payloads.

## Server functions

- Live under `src/services/<domain>/*.functions.ts`.
- Read `process.env.*` only inside `.handler()`.
- Use `requireSupabaseAuth` when the fn acts as a user; use the server
  publishable client for public reads; use `supabaseAdmin` (loaded inside
  the handler) only for verified privileged writes.

## Testing

- Pure logic in `libs/*` and `packages/utils` is unit-tested with Vitest.
- End-to-end flows land under `tests/e2e/` and run through Playwright
  against `bun run dev`.
- A change to a server fn ships with a test that exercises its zod contract.

## Style & tooling

- ESLint + Prettier are enforced; format on save.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- Husky + lint-staged run lint + typecheck on staged files before commit
  once the repo is exported to GitHub; on Lovable, CI runs on every build.
