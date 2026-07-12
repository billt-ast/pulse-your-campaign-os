# Pulse Design System

The Pulse design system extracts the visual language established in the
Phase 2A landing experience into reusable, typed primitives. **Every
authenticated page consumes these primitives** — hand-rolled shells and
one-off styling are a build-quality failure.

## Tokens (`src/styles.css`)

All raw values live in `styles.css` as CSS custom properties inside
`@theme` (Tailwind v4). Semantic aliases (`--color-navy`, `--color-ink`,
`--color-graphite`, `--color-civic`, `--color-hairline`, `--color-paper`)
generate `bg-*`, `text-*`, `border-*` utilities automatically.

| Token         | Purpose                                       |
| ------------- | --------------------------------------------- |
| `paper`       | Canvas background (warm white)                |
| `ink`         | Primary text / interactive surface            |
| `graphite`    | Secondary text                                |
| `hairline`    | 1px borders, subtle dividers                  |
| `navy`        | Primary brand color                           |
| `navy-soft`   | Muted brand accent                            |
| `civic`       | Accent / success                              |
| `civic-soft`  | Muted accent                                  |

### Typography

| Family                                   | Usage                       |
| ---------------------------------------- | --------------------------- |
| Instrument Serif (`--font-display`)      | `<h1>`–`<h3>`, `.font-display` |
| Inter (`--font-sans`)                    | Body, UI, labels            |
| JetBrains Mono (`--font-mono`)           | Code, tabular numerics      |

Fonts are loaded via `<link>` in `src/routes/__root.tsx`. Never `@import`
a remote font URL in `styles.css` — Lightning CSS resolves imports from
the filesystem.

### Motion

Defined in `src/components/pulse/tokens.ts`:

```ts
motion.ease.entrance   // [0.16, 1, 0.3, 1]  — cinematic ease-out
motion.duration.base   // 0.32s               — default reveal
motion.stagger.base    // 0.08s               — sequenced reveals
```

## Primitives (`src/components/pulse/`)

| Export           | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `AppShell`       | Sidebar + topbar + main pane for every authenticated page |
| `SectionHeading` | Eyebrow + title + description + actions row              |
| `PulseCard`      | Bordered, radius-2xl card surface                        |
| `PanelFrame`     | Card with title/description/actions header               |
| `StatCard`       | KPI tile (label + value + delta + hint)                  |
| `DashboardGrid`  | Responsive 1→2→4 column grid                             |
| `ChartFrame`     | Placeholder chart surface (Recharts drop-in later)       |
| `MapFrame`       | Placeholder map surface (Mapbox drop-in later)           |
| `ComingSoon`     | Scaffolded-module message with bullets                   |
| `Reveal`         | Motion wrapper for entrance reveals                      |

## Composition rules

1. Every authenticated page starts with `<AppShell eyebrow=... title=...>`.
2. Group KPIs in a `<DashboardGrid>` of `<StatCard>`s.
3. Group panels using `<PanelFrame>` — never bare `<div>`s with borders.
4. Motion is opt-in via `<Reveal>`; do NOT animate on scroll for interior
   pages.
5. Use `bg-paper`, `bg-card`, `bg-ink` — never `bg-white`, `bg-black`,
   `bg-[#…]`.
6. Focus rings and outlines are global (`src/styles.css`). Do NOT
   override per-component.

## shadcn/ui interop

shadcn primitives (Button, Input, Dialog, Drawer, …) remain the low-level
foundation. Pulse primitives compose them; consumers may still reach for
shadcn directly. Do NOT re-theme shadcn per page.

## Extension

Adding a primitive:

1. Add the component in `src/components/pulse/`.
2. Export from `src/components/pulse/index.ts`.
3. Document it in the table above.
4. Refactor two existing usages to the new primitive in the same commit.
