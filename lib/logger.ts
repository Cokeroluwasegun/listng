type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

const REDACT_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "x-paystack-signature",
  "api_key",
  "apiKey",
  "credit_card",
  "card_number",
  "cvv",
  "pin",
  "faceDescriptor",
]);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[depth-limit]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.has(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

interface LogMeta {
  requestId?: string;
  userId?: string;
  route?: string;
  [k: string]: unknown;
}

function emit(level: LogLevel, msg: string, meta?: LogMeta) {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;
  const record = {
    level,
    msg,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "development",
    ...(meta ? { ...(redact(meta) as object) } : {}),
  };
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, meta?: LogMeta) => emit("debug", msg, meta),
  info: (msg: string, meta?: LogMeta) => emit("info", msg, meta),
  warn: (msg: string, meta?: LogMeta) => emit("warn", msg, meta),
  error: (msg: string, meta?: LogMeta) => emit("error", msg, meta),
  child(bindings: LogMeta) {
    return {
      debug: (msg: string, meta?: LogMeta) => emit("debug", msg, { ...bindings, ...meta }),
      info: (msg: string, meta?: LogMeta) => emit("info", msg, { ...bindings, ...meta }),
      warn: (msg: string, meta?: LogMeta) => emit("warn", msg, { ...bindings, ...meta }),
      error: (msg: string, meta?: LogMeta) => emit("error", msg, { ...bindings, ...meta }),
    };
  },
};

export function newRequestId(): string {
  return crypto.randomUUID();
}
