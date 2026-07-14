# Release Workflow

## Environments

| Environment | URL pattern                                    | Trigger                          |
| ----------- | ---------------------------------------------- | -------------------------------- |
| Preview     | `id-preview--<project>.lovable.app`            | Every Lovable edit               |
| Preview (stable) | `project--<project-id>-dev.lovable.app`   | Latest preview build             |
| Production  | `<slug>.lovable.app` + custom domains          | Publish action                   |
| Production (stable) | `project--<project-id>.lovable.app`    | Latest published build           |

## Release steps (Lovable)

1. Merge / commit changes.
2. Verify the preview at the stable preview URL.
3. Trigger **Publish** to promote the current preview to production.
4. Verify production at the stable production URL.
5. Announce in `docs/CHANGELOG.md` and, if user-facing, in the app.

## Release steps (GitHub export)

Once the repo is exported to GitHub:

1. Open a PR — the `Pull Request Validation` workflow runs typecheck +
   lint + unit tests.
2. Squash-merge to `main` — the `Main Branch` workflow runs integration
   tests and publishes artifacts.
3. Tag `vX.Y.Z` following semver.
4. Deploy the artifact via the target platform (Cloudflare / Vercel /
   custom).

CI workflow stubs live under `.github/workflows/`.

## Versioning

- **App**: date-based (`YYYY.MM.DD`) tags for releases.
- **Contracts** (`@/packages/validators`): semver — a breaking change to a
  request/response schema is a minor bump pre-1.0, major thereafter.

## Post-release

Domain events (`libs/events`) always emit `release.deployed` with the
release id so the audit context can record the change.
