# Changelog

All notable changes to Pulse are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/) and this project
adheres to Semantic Versioning once a stable release is cut.

## [Unreleased]

### Added
- **Phase 2B.1.1B — Workspace Architecture.** Lovable-adapted monorepo
  layout under `src/packages/*`, `src/services/*`, `src/libs/*`,
  `src/workers/*` with per-module READMEs, barrel exports, and
  [MONOREPO_MAPPING.md](./MONOREPO_MAPPING.md) describing the extraction
  path to a real pnpm workspace.
- Engineering docs: `ENGINEERING_GUIDELINES.md`, `SECURITY.md`,
  `DEPLOYMENT.md`, `CHANGELOG.md`.
- Root scaffolding for `.github/workflows`, `.vscode`, `scripts/`,
  `configs/`, `assets/`, `tests/`, `examples/`, `templates/`.

### Notes
- pnpm workspaces, Next.js apps, NestJS services, Expo, Terraform and
  Storybook are not part of Lovable's runtime. Their intent is preserved
  through folder boundaries and documented in `MONOREPO_MAPPING.md`.
