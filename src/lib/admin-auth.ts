import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
const COOKIE = "pcg_admin";
const secret = () => process.env.ANALYTICS_ADMIN_TOKEN || "";
export function validToken(value: string) {
  const token = secret();
  if (token.length < 32) return false;
  const a = Buffer.from(value); const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a,b);
}
function signature(time: string) { return createHmac("sha256", secret()).update(`admin:${time}`).digest("hex"); }
export function issueSession() { const time = String(Math.floor(Date.now()/1000)); return `${time}.${signature(time)}`; }
export function isAdmin() {
  if (secret().length < 32) return false;
  const cookie = cookies().get(COOKIE)?.value || "";
  const [time, mac] = cookie.split(".");
  if (!/^\d{10}$/.test(time || "") || !/^[0-9a-f]{64}$/.test(mac || "")) return false;
  if (Math.abs(Date.now()/1000 - Number(time)) > 8*3600) return false;
  const a = Buffer.from(mac,"hex"); const b = Buffer.from(signature(time),"hex");
  return timingSafeEqual(a,b);
}
export const ADMIN_COOKIE=COOKIE;
