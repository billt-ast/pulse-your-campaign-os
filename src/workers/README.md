# workers/

Background-processing intents. Lovable has no separate worker runtime, so
each "worker" is documented here and implemented as a `pg_cron` job that
POSTs to a `/api/public/workers/<name>` server route, or as a Postgres
trigger that dispatches via `pg_net`.

See each subfolder's README for its Lovable-native implementation plan.
