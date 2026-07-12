# Coding Standards

## TypeScript

- `strict: true`. `noUncheckedSideEffectImports: true`.
- No `any`. If a value is truly dynamic, model it as `unknown` and narrow.
- Prefer inference over annotation, especially for route params, loader
  data and TanStack Query returns. Do NOT cast (`as X`) inferred values.
- Portable types only: use `ReturnType<typeof setTimeout>`, not
  `NodeJS.Timeout`; `import type { ReactNode } from "react"`, not
  `React.ReactNode`.

## React

- Function components, hooks only.
- Every effect declares its cleanup.
- Server data comes from TanStack Query + server fns. Never `useEffect + fetch`.
- Browser globals (`window`, `document`, `localStorage`) are accessed only
  inside `useEffect`, event handlers, `<ClientOnly>` or under
  `useHydrated() === true`.

## File layout

- Components: `PascalCase.tsx`.
- Hooks: `useCamelCase.ts` in `src/hooks/`.
- Pure utils: `camelCase.ts` in `src/lib/`.
- Server fns: `<domain>.functions.ts`.
- Server-only helpers: `<name>.server.ts`.

## Imports

- Alias `@/*` for `src/*`. No relative parent walking beyond one level.
- Sort: React → third-party → `@/*` → relative → styles.

## Styling

- Tailwind v4 utilities in `className`.
- Design tokens in `src/styles.css` under `@theme`. Never hardcode hex or
  named colors — use semantic tokens (`bg-navy`, `text-ink`, `text-graphite`).
- Custom utilities via `@utility`, never `@layer utilities`.

## Accessibility

- Every route ships a single `<h1>` (rendered by `AppShell` or the page).
- Focus-visible outlines on every interactive element (global CSS).
- Icons that are decorative are `aria-hidden`. Icons that carry meaning
  get an `aria-label` or accompanying text.
- Skip link on public pages.

## Testing

- Vitest for unit tests (`*.test.ts` colocated with the target).
- Playwright for end-to-end (deferred to Phase 2B.1.3).

## Commits

- Conventional-commit-friendly imperative subject: `feat(gis): add layers view`.
- One logical change per commit. Refactors separate from features.
