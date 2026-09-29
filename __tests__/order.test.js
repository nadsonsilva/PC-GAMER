const { ORDER_STATUS, mapMercadoPagoStatus, orderStatusLabel } = require("../src/lib/order");

describe("estados do pedido", () => {
  test("mapeia pagamento aprovado para PAID", () => {
    expect(mapMercadoPagoStatus("approved")).toBe(ORDER_STATUS.PAID);
  });

  test("mapeia estados pendentes e em análise", () => {
    expect(mapMercadoPagoStatus("pending")).toBe(ORDER_STATUS.PENDING_PAYMENT);
    expect(mapMercadoPagoStatus("in_process")).toBe(ORDER_STATUS.PAYMENT_REVIEW);
  });

  test("mapeia recusado, cancelado e reembolsado", () => {
    expect(mapMercadoPagoStatus("rejected")).toBe(ORDER_STATUS.PAYMENT_REJECTED);
    expect(mapMercadoPagoStatus("cancelled")).toBe(ORDER_STATUS.CANCELLED);
    expect(mapMercadoPagoStatus("refunded")).toBe(ORDER_STATUS.REFUNDED);
  });

  test("gera rótulos amigáveis", () => {
    expect(orderStatusLabel(ORDER_STATUS.PENDING_PAYMENT)).toBe("Aguardando pagamento");
    expect(orderStatusLabel(ORDER_STATUS.PAID)).toBe("Pago");
  });
});
