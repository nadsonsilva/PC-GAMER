import { logEvent, logFailure } from "@/lib/telemetry";
import { NextResponse } from "next/server";
import { getPayment, validateWebhookSignature } from "@/lib/mercado-pago";
import { processVerifiedPayment } from "@/lib/payment-confirmation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    if (Number(request.headers.get("content-length") || 0) > 8192) return NextResponse.json({ ok: false }, { status: 413 });
    const body = await request.json().catch(() => ({}));
    const queryId = url.searchParams.get("data.id");
    const bodyId = body?.data?.id != null ? String(body.data.id) : null;
    // Reject inconsistent identifiers rather than validating one and consulting another.
    if (queryId && bodyId && queryId !== bodyId) {
      return NextResponse.json({ ok: false, message: "Identificadores divergentes." }, { status: 400 });
    }
    const dataId = queryId || bodyId;
    const eventType = url.searchParams.get("type") || body?.type;
    const valid = validateWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });
    if (!valid) return NextResponse.json({ ok: false, message: "Assinatura inválida." }, { status: 401 });
    if (eventType !== "payment" || !dataId || !/^\d+$/.test(dataId)) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    const payment = await getPayment(dataId);
    if (String(payment.id) !== dataId) {
      return NextResponse.json({ ok: false, message: "Pagamento divergente." }, { status: 400 });
    }
    const result = await processVerifiedPayment(payment);
    logEvent("webhook_processed", { status: "status" in result ? String(result.status) : "ignored" });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logFailure("webhook_failed", error);
    return NextResponse.json({ ok: false, message: "Falha ao processar notificação." }, { status: 500 });
  }
}
