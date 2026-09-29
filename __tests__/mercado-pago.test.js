const { createHmac } = require("crypto");
const { validateWebhookSignature } = require("../src/lib/mercado-pago");

describe("assinatura do webhook Mercado Pago", () => {
  test("aceita uma assinatura HMAC válida", () => {
    const secret = "segredo-webhook-de-teste";
    const dataId = "123456789";
    const requestId = "request-abc";
    const ts = "1780000000000";
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = createHmac("sha256", secret).update(manifest).digest("hex");

    expect(
      validateWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(true);
  });

  test("rejeita assinatura alterada", () => {
    expect(
      validateWebhookSignature({
        xSignature: `ts=1780000000000,v1=${"0".repeat(64)}`,
        xRequestId: "request-abc",
        dataId: "123456789",
        secret: "segredo-webhook-de-teste",
      }),
    ).toBe(false);
  });
});
