/**
 * @pulse/logging — structured JSON logger.
 *
 * One line per event, JSON-encoded, safe for Cloudflare Workers log drains.
 * Level is controlled by `LOG_LEVEL` (default `info`). Attach a correlation
 * id + tenant id via `logger.child({...})` to preserve request context.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function currentLevel(): LogLevel {
  const raw = (typeof process !== "undefined" ? process.env?.LOG_LEVEL : undefined) ?? "info";
  return (["debug", "info", "warn", "error"].includes(raw) ? raw : "info") as LogLevel;
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

function make(bindings: Record<string, unknown> = {}): Logger {
  const threshold = ORDER[currentLevel()];
  const emit = (level: LogLevel, msg: string, ctx?: Record<string, unknown>) => {
    if (ORDER[level] < threshold) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...bindings,
      ...(ctx ?? {}),
    });
    const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    sink(line);
  };
  return {
    debug: (m, c) => emit("debug", m, c),
    info: (m, c) => emit("info", m, c),
    warn: (m, c) => emit("warn", m, c),
    error: (m, c) => emit("error", m, c),
    child: (extra) => make({ ...bindings, ...extra }),
  };
}

export const logger: Logger = make({ app: "pulse" });
