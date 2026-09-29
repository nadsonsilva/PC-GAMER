import { createHmac, timingSafeEqual } from "crypto";
import { product } from "@/lib/product";

const MP_API = "https://api.mercadopago.com";

function accessToken() {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return token;
}

export type CheckoutPreference = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export type MercadoPagoPayment = {
  id: number | string;
  status?: string;
  external_reference?: string | null;
  transaction_amount?: number;
};

export async function createCheckoutPreference(input: {
  orderId: string;
  orderNumber: number;
  payerEmail: string;
}) {
  //const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const configuredWebhook = process.env.MP_WEBHOOK_URL?.trim();

  const body: Record<string, unknown> = {
    items: [
      {
        id: "pc-gamer-titan-elite",
        title: product.name,
        description: "PC Gamer montado e testado conforme a ficha técnica do projeto.",
        quantity: 1,
        currency_id: product.currency,
        unit_price: product.priceCents / 100,
      },
    ],
    payer: { email: input.payerEmail },
    external_reference: input.orderId,
    /*back_urls: {
      success: `${appUrl}/pedido/retorno?order=${input.orderNumber}&result=success`,
      pending: `${appUrl}/pedido/retorno?order=${input.orderNumber}&result=pending`,
      failure: `${appUrl}/pedido/retorno?order=${input.orderNumber}&result=failure`,
    },
    auto_return: "approved", */
    statement_descriptor: "PC GAMER",
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
  };

  if (configuredWebhook) body.notification_url = configuredWebhook;

  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.orderId,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json()) as CheckoutPreference & { message?: string; error?: string };
  if (!response.ok || !data.id) {
    throw new Error(data.message || data.error || "Falha ao criar preferência no Mercado Pago.");
  }

  const useSandbox = process.env.MP_USE_SANDBOX !== "false";
  const checkoutUrl = useSandbox
    ? data.sandbox_init_point || data.init_point
    : data.init_point || data.sandbox_init_point;

  if (!checkoutUrl) throw new Error("Mercado Pago não retornou URL de checkout.");

  return { preferenceId: data.id, checkoutUrl };
}

export async function getPayment(paymentId: string) {
  const response = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: "no-store",
  });

  const data = (await response.json()) as MercadoPagoPayment & { message?: string; error?: string };
  if (!response.ok || data.id == null) {
    throw new Error(data.message || data.error || "Falha ao consultar pagamento no Mercado Pago.");
  }
  return data;
}

export function validateWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret?: string;
}) {
  const secret = input.secret ?? process.env.MP_WEBHOOK_SECRET?.trim();
  if (!secret || !input.xSignature || !input.xRequestId || !input.dataId) return false;

  const parts = Object.fromEntries(
    input.xSignature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );

  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received || !/^[a-f0-9]{64}$/i.test(received)) return false;

  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}
