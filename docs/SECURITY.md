# Security

## Principles

1. **RLS-first.** Every `public` table has RLS enabled and per-tenant
   policies. No table ships without GRANTs in the same migration.
2. **Server-only secrets.** `process.env.*` is only read inside
   `createServerFn` handlers or server-only helpers. Never `VITE_`-prefixed.
3. **Least privilege.** `supabaseAdmin` is reserved for verified privileged
   writes; ordinary reads use the signed-in user's session (RLS applies).
4. **Roles in a dedicated table.** Role membership lives in `user_roles`
   and is checked via the `has_role()` security-definer function — never
   on `profiles`, never in client storage.
5. **Verified inbound.** Public API routes under `/api/public/*` verify
   signatures with timing-safe compare before any state change.
6. **Auditability.** Consequential mutations emit a domain event consumed
   by the Audit context; audit rows are append-only.

## Reporting

Report suspected vulnerabilities privately to the maintainers. Do not open
public issues for security reports.
