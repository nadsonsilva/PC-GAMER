import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function authenticated(value: string | null) {
  const token = process.env.ANALYTICS_ADMIN_TOKEN;
  if (!token || token.length < 32 || !value?.startsWith("Bearer ")) return false;
  const a = Buffer.from(value.slice(7)); const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function GET(request: Request) {
  if (!authenticated(request.headers.get("authorization"))) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  try {
    const [leads, verified, orders, paid, revenue] = await Promise.all([
      prisma.lead.count(), prisma.lead.count({ where: { verifiedAt: { not: null } } }),
      prisma.order.count(), prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    ]);
    return NextResponse.json({ leads, verifiedLeads: verified, orders, paidOrders: paid, paidRevenueCents: revenue._sum.amountCents ?? 0, conversionPercent: orders ? Math.round(paid / orders * 10000) / 100 : 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Erro na consulta" }, { status: 503 }); }
}
