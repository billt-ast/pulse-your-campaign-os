# packages/

Reusable, framework-agnostic modules that any surface of Pulse may import.
Each subfolder is a would-be npm package; see its `README.md` for scope
and extraction plan.

**Rule:** consumers import from `@/packages/<name>` (barrel). Deep imports
are forbidden — they leak internals across the future package boundary.
