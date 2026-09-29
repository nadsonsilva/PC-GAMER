import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { product } from "@/lib/product";
import { createCheckoutPreference } from "@/lib/mercado-pago";
import { ORDER_STATUS } from "@/lib/order";
import { createOrderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = createOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findUnique({ where: { email: parsed.data.email } });
    if (!lead?.verifiedAt) {
      return NextResponse.json(
        { ok: false, message: "Valide o e-mail antes de criar o pedido." },
        { status: 403 },
      );
    }

    const order = await prisma.order.create({
      data: {
        leadId: lead.id,
        amountCents: product.priceCents,
        status: ORDER_STATUS.PENDING_PAYMENT,
      },
    });

    try {
      const checkout = await createCheckoutPreference({
        orderId: order.id,
        orderNumber: order.number,
        payerEmail: lead.email,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          preferenceId: checkout.preferenceId,
          checkoutUrl: checkout.checkoutUrl,
        } as any,
      });

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
        checkoutUrl: checkout.checkoutUrl,
        environment: process.env.MP_USE_SANDBOX !== "false" ? "sandbox" : "production",
      });
    } catch (error) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: ORDER_STATUS.CHECKOUT_ERROR },
      });
      throw error;
    }
  } catch (error) {
    console.error("Erro ao criar pedido/checkout:", error);
    return NextResponse.json(
      { ok: false, message: "Não foi possível iniciar o pagamento. Verifique a configuração do Mercado Pago." },
      { status: 500 },
    );
  }
}
