# Package Registry

Every module under `src/packages/*` ships as a barrel export. Consumers
import from `@/packages/<name>` — never a deep path — so future extraction
to a real pnpm workspace is a mechanical rename.

| Package             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `ai-sdk`            | Client wrapper for the Lovable AI Gateway          |
| `analytics-sdk`     | Client + server helpers for the analytics service  |
| `animations`        | Motion presets built on framer-motion              |
| `auth`              | React helpers around Supabase auth                 |
| `charts`            | Recharts primitives themed with Pulse tokens       |
| `config`            | Runtime feature configuration                      |
| `design-system`     | Barrel over `src/components/pulse/*`               |
| `feature-flags`     | Client-side feature-flag hooks                     |
| `forms`             | react-hook-form + Zod adapters                     |
| `gis-sdk`           | Geospatial helpers (bbox, projection)              |
| `hooks`             | Reusable React hooks                               |
| `icons`             | Curated lucide-react re-exports                    |
| `maps`              | Map primitives (Mapbox / MapLibre)                 |
| `navigation`        | Route-aware nav primitives                         |
| `notifications-sdk` | Client for the notifications service               |
| `tables`            | TanStack Table primitives                          |
| `telemetry`         | Client trace + span helpers                        |
| `theme`             | Theme provider + token bridge                      |
| `types`             | Cross-cutting TS types (brands, IDs)               |
| `ui`                | shadcn/ui re-exports                               |
| `utils`             | Pure utilities (`cn`, formatters)                  |
| `validators`        | Zod primitives + Mission model (shared contracts)  |
