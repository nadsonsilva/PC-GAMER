import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resendOtpSchema } from "@/lib/validation";
import { issueOtp, OtpCooldownError } from "@/lib/otp-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = resendOtpSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "E-mail inválido." }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { email: parsed.data.email } });
    if (!lead) {
      // Resposta genérica para não revelar se um e-mail está ou não cadastrado.
      return NextResponse.json({
        ok: true,
        message: "Se o e-mail estiver cadastrado, um novo código será enviado.",
        resendIn: 60,
      });
    }

    const otp = await issueOtp(lead.id, lead.email);
    return NextResponse.json({ ok: true, message: "Novo código enviado.", ...otp });
  } catch (error) {
    if (error instanceof OtpCooldownError) {
      return NextResponse.json(
        { ok: false, message: error.message, retryAfter: error.retryAfter },
        { status: 429 },
      );
    }

    console.error("Erro no reenvio do OTP:", error);
    return NextResponse.json({ ok: false, message: "Falha ao reenviar o código." }, { status: 500 });
  }
}
