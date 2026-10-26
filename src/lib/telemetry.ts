import { saveErrorToDrive } from "@/lib/drive-logs";
// Structured, low-cardinality events only: no PII, credentials or raw payment payloads.
export function logEvent(event: string, details: Record<string, string | number | boolean | null> = {}) {
  console.info(JSON.stringify({ time: new Date().toISOString(), level: "info", event, ...details }));
}
export function logFailure(event: string, error: unknown) {
  const kind = error instanceof Error ? error.name : "UnknownError";
  console.error(JSON.stringify({ time: new Date().toISOString(), level: "error", event, errorType: kind }));
  void saveErrorToDrive(event,kind).catch(()=>{});
  const hook = process.env.DISCORD_ERROR_WEBHOOK_URL;
  if (hook && /^https:\/\/(discord.com|discordapp.com)\/api\/webhooks\//.test(hook)) {
    void fetch(hook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:`PC GAMER - erro: ${event.slice(0,80)} (${kind})`}),signal:AbortSignal.timeout(5000)}).catch(()=>{});
  }
}
