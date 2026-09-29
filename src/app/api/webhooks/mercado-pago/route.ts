import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, validateWebhookSignature } from "@/lib/mercado-pago";
import { mapMercadoPagoStatus, ORDER_STATUS } from "@/lib/order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const dataId = url.searchParams.get("data.id") || body?.data?.id?.toString() || null;
    const eventType = url.searchParams.get("type") || body?.type || null;
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    console.info("Webhook Mercado Pago recebido", {
      type: eventType,
      dataId,
      requestId: xRequestId,
    });

    const valid = validateWebhookSignature({ xSignature, xRequestId, dataId });
    if (!valid) {
      console.warn("Webhook Mercado Pago com assinatura inválida.");
      return NextResponse.json({ ok: false, message: "Assinatura inválida." }, { status: 401 });
    }

    if (eventType !== "payment" || !dataId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const payment = await getPayment(dataId);
    if (!payment.external_reference) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Pagamento sem external_reference." });
    }

    const order = await prisma.order.findUnique({ where: { id: payment.external_reference } });
    if (!order) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Pedido não encontrado." });
    }

    const paidAmountCents = Math.round(Number(payment.transaction_amount ?? 0) * 100);
    let nextStatus = mapMercadoPagoStatus(payment.status);

    if (nextStatus === ORDER_STATUS.PAID && paidAmountCents !== order.amountCents) {
      console.warn("Valor divergente no pagamento", {
        orderId: order.id,
        expected: order.amountCents,
        received: paidAmountCents,
      });
      nextStatus = ORDER_STATUS.PAYMENT_REVIEW;
    }

    const now = new Date();
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: String(payment.id),
        lastPaymentStatus: payment.status ?? null,
        status: nextStatus,
        paymentUpdatedAt: now,
        paidAt: nextStatus === ORDER_STATUS.PAID ? order.paidAt ?? now : order.paidAt,
      } as any,
    });

    console.info("Pedido atualizado pelo webhook", {
      orderId: order.id,
      orderNumber: order.number,
      status: nextStatus,
      paymentId: String(payment.id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
