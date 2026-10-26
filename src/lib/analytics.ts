export const EVENTS = ["visualizou_produto","clicou_whatsapp","enviou_formulario","email_verificado","iniciou_checkout","compra_concluida"] as const;
export type AnalyticsName = typeof EVENTS[number];
export function track(name:AnalyticsName) {
  if (typeof window === "undefined") return;
  try { (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.("event",name); } catch {}
  void fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name}),keepalive:true}).catch(()=>{});
}
