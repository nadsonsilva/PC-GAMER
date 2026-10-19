// Structured, low-cardinality events only: no PII, credentials or raw payment payloads.
export function logEvent(event: string, details: Record<string, string | number | boolean | null> = {}) {
  console.info(JSON.stringify({ time: new Date().toISOString(), level: "info", event, ...details }));
}
export function logFailure(event: string, error: unknown) {
  const kind = error instanceof Error ? error.name : "UnknownError";
  console.error(JSON.stringify({ time: new Date().toISOString(), level: "error", event, errorType: kind }));
}
