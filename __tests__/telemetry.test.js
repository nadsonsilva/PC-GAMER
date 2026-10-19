const { logEvent, logFailure } = require("../src/lib/telemetry");
test("log estruturado não inclui dados pessoais quando apenas metadados são passados", () => {
  const spy = jest.spyOn(console, "info").mockImplementation(() => {});
  logEvent("checkout_created", { status: "PENDING_PAYMENT" });
  expect(JSON.parse(spy.mock.calls[0][0])).toMatchObject({ event: "checkout_created", status: "PENDING_PAYMENT" });
  spy.mockRestore();
});
test("falhas não imprimem mensagens de erro com possíveis segredos", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  logFailure("payment_failed", new Error("token secreto"));
  expect(spy.mock.calls[0][0]).not.toContain("token secreto");
  spy.mockRestore();
});
