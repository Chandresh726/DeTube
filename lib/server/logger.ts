type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, route: string, message: string, extra?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    route,
    msg: message,
    ...(extra !== undefined ? { extra } : {}),
  };
  if (level === "error") console.error(JSON.stringify(payload));
  else if (level === "warn") console.warn(JSON.stringify(payload));
  else console.log(JSON.stringify(payload));
}

export function logInfo(route: string, message: string, extra?: unknown) {
  log("info", route, message, extra);
}

export function logWarn(route: string, message: string, extra?: unknown) {
  log("warn", route, message, extra);
}

export function logError(route: string, message: string, extra?: unknown) {
  log("error", route, message, extra);
}
