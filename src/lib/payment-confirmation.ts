import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { MercadoPagoPayment } from "@/lib/mercado-pago";
import { mapMercadoPagoStatus, ORDER_STATUS } from "@/lib/order";

/** Only the provider's verified API response can authorize an order state change. */
export async function processVerifiedPayment(payment: MercadoPagoPayment) {
  if (!payment.external_reference || payment.id == null) return { ignored: "missing_reference" };
  const order = await prisma.order.findUnique({
    where: { id: payment.external_reference },
    include: { lead: true },
  });
  if (!order) return { ignored: "unknown_order" };

  const paidAmountCents = Math.round(Number(payment.transaction_amount) * 100);
  const validAmount = Number.isFinite(paidAmountCents) && paidAmountCents === order.amountCents;
  const validCurrency = payment.currency_id === "BRL";
  const status = mapMercadoPagoStatus(payment.status);
  const paymentId = String(payment.id);

  // Never downgrade a paid order due to late/out-of-order notifications.
  // A refund or chargeback for the SAME payment is a legitimate later transition.
  if (order.status === ORDER_STATUS.PAID && status !== ORDER_STATUS.REFUNDED) {
    if (status !== ORDER_STATUS.PAID || (order.paymentId && order.paymentId !== paymentId)) {
      return { ignored: "already_paid" };
    }
  }
  if (order.status === ORDER_STATUS.REFUNDED) return { ignored: "already_refunded" };

  // An order cannot be credited from a different payment after it is paid.
  if (order.paymentId && order.status === ORDER_STATUS.PAID && order.paymentId !== paymentId) {
    return { ignored: "different_payment" };
  }

  const nextStatus = status === ORDER_STATUS.PAID && (!validAmount || !validCurrency)
    ? ORDER_STATUS.PAYMENT_REVIEW
    : status;

  // Compare-and-set prevents a late or simultaneous webhook from overwriting a newer state.
  // The same transition is idempotent and a refund requires the original payment ID.
  const transitions = nextStatus === ORDER_STATUS.REFUNDED
    ? { status: ORDER_STATUS.PAID, paymentId }
    : { status: order.status, paymentId: order.paymentId };
  if (nextStatus === ORDER_STATUS.REFUNDED && (order.status !== ORDER_STATUS.PAID || order.paymentId !== paymentId)) {
    return { ignored: "refund_not_original_payment" };
  }
  const now = new Date();
  const updated = await prisma.order.updateMany({
    where: { id: order.id, ...transitions },
    data: {
      paymentId,
      lastPaymentStatus: payment.status ?? null,
      status: nextStatus,
      paymentUpdatedAt: now,
      ...(nextStatus === ORDER_STATUS.PAID && !order.paidAt ? { paidAt: now } : {}),
    },
  });
  if (updated.count === 0) return { ignored: "concurrent_transition" };

  if (nextStatus === ORDER_STATUS.PAID && order.status !== ORDER_STATUS.PAID) {
    try { await prisma.analyticsEvent.create({data:{name:"compra_concluida"}}); } catch { /* analytics must never interfere with payment */ }
  }

  if (nextStatus === ORDER_STATUS.PAID) {
    // Atomic claim ensures concurrent duplicate webhook calls do not send two emails.
    // A stale claim can be reclaimed if a worker crashed before sending.
    const stale = new Date(Date.now() - 10 * 60 * 1000);
    const claimed = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: ORDER_STATUS.PAID,
        confirmationEmailSentAt: null,
        OR: [{ confirmationEmailClaimedAt: null }, { confirmationEmailClaimedAt: { lt: stale } }],
      },
      data: { confirmationEmailClaimedAt: new Date() },
    });
    if (claimed.count === 1) {
      try {
        const result = await sendPaymentConfirmationEmail(order.lead.email, order.lead.name, order.number, order.amountCents, order.id);
        // Development simulation is NOT a delivered message: allow real delivery later.
        await prisma.order.update({
          where: { id: order.id },
          data: { confirmationEmailSentAt: result.simulated ? null : new Date(), confirmationEmailClaimedAt: null },
        });
      } catch (error) {
        await prisma.order.update({ where: { id: order.id }, data: { confirmationEmailClaimedAt: null } });
        // The payment remains PAID; repeat notification can retry email safely.
        console.error("Falha ao enviar confirmação do pedido", order.number, error);
        return { status: nextStatus, emailError: true };
      }
    }
  }
  return { status: nextStatus };
}
