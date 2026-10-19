const mockFind = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateMany = jest.fn();
const mockEmail = jest.fn();
jest.mock("../src/lib/prisma", () => ({ prisma: { order: {
  findUnique: (...args) => mockFind(...args),
  update: (...args) => mockUpdate(...args),
  updateMany: (...args) => mockUpdateMany(...args),
} } }));
jest.mock("../src/lib/email", () => ({ sendPaymentConfirmationEmail: (...args) => mockEmail(...args) }));
const { processVerifiedPayment } = require("../src/lib/payment-confirmation");
const baseOrder = { id: "o1", number: 5, amountCents: 499900, status: "PENDING_PAYMENT", paymentId: null, paidAt: null, lead: { email: "a@example.com", name: "Ana" } };
const payment = { id: 123, status: "approved", external_reference: "o1", transaction_amount: 4999, currency_id: "BRL" };
beforeEach(() => {
  jest.clearAllMocks();
  mockFind.mockResolvedValue({ ...baseOrder });
  mockUpdate.mockResolvedValue({});
  mockUpdateMany.mockResolvedValue({ count: 1 });
  mockEmail.mockResolvedValue({ simulated: false });
});
test("aprova pagamento conferido e envia confirmação", async () => {
  expect(await processVerifiedPayment(payment)).toMatchObject({ status: "PAID" });
  expect(mockUpdate.mock.calls[0][0].data.status).toBe("PAID");
  expect(mockEmail).toHaveBeenCalledTimes(1);
});
test("valor divergente vai para análise e não envia email", async () => {
  expect(await processVerifiedPayment({ ...payment, transaction_amount: 10 })).toMatchObject({ status: "PAYMENT_REVIEW" });
  expect(mockEmail).not.toHaveBeenCalled();
});
test("moeda divergente não aprova", async () => {
  expect(await processVerifiedPayment({ ...payment, currency_id: "USD" })).toMatchObject({ status: "PAYMENT_REVIEW" });
});
test("webhook tardio não regride pedido pago", async () => {
  mockFind.mockResolvedValue({ ...baseOrder, status: "PAID", paymentId: "123" });
  expect(await processVerifiedPayment({ ...payment, status: "pending" })).toMatchObject({ ignored: "already_paid" });
  expect(mockUpdate).not.toHaveBeenCalled();
});
test("duplicidade não dispara segundo email após claim recusado", async () => {
  mockUpdateMany.mockResolvedValue({ count: 0 });
  await processVerifiedPayment(payment);
  expect(mockEmail).not.toHaveBeenCalled();
});
test("falha SMTP não desfaz pagamento e permite retry", async () => {
  mockEmail.mockRejectedValue(new Error("SMTP fora"));
  expect(await processVerifiedPayment(payment)).toMatchObject({ status: "PAID", emailError: true });
  expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { confirmationEmailClaimedAt: null } }));
});
test("estorno altera status do pagamento original", async () => {
  mockFind.mockResolvedValue({ ...baseOrder, status: "PAID", paymentId: "123" });
  expect(await processVerifiedPayment({ ...payment, status: "refunded" })).toMatchObject({ status: "REFUNDED" });
  expect(mockEmail).not.toHaveBeenCalled();
});
