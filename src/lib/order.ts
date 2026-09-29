export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PAYMENT_REVIEW: "PAYMENT_REVIEW",
  CHECKOUT_ERROR: "CHECKOUT_ERROR",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    PAID: "Pago",
    PAYMENT_REJECTED: "Pagamento recusado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
    PAYMENT_REVIEW: "Pagamento em análise",
    CHECKOUT_ERROR: "Erro ao iniciar pagamento",
  };
  return labels[status] ?? status;
}

export function mapMercadoPagoStatus(status?: string | null): OrderStatus {
  switch (status) {
    case "approved":
      return ORDER_STATUS.PAID;
    case "rejected":
      return ORDER_STATUS.PAYMENT_REJECTED;
    case "cancelled":
      return ORDER_STATUS.CANCELLED;
    case "refunded":
    case "charged_back":
      return ORDER_STATUS.REFUNDED;
    case "in_process":
    case "in_mediation":
      return ORDER_STATUS.PAYMENT_REVIEW;
    case "pending":
    case "authorized":
    default:
      return ORDER_STATUS.PENDING_PAYMENT;
  }
}
