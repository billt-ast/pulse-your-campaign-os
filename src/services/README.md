# services/

Domain-oriented server logic. Each subfolder owns one bounded context and
exposes its capabilities exclusively through `createServerFn` handlers and
zod contracts. Services never import each other; cross-context work flows
through domain events in `libs/events`.
