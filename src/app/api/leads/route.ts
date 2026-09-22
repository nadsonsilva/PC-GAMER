import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import { issueOtp, OtpCooldownError } from "@/lib/otp-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const lead = await prisma.lead.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        whatsapp: data.whatsapp,
        cep: data.cep,
        address: data.address,
        verifiedAt: null,
      },
      create: data,
    });

    const otp = await issueOtp(lead.id, lead.email);

    return NextResponse.json({
      ok: true,
      email: lead.email,
      message: "Lead salvo e código enviado por e-mail.",
      ...otp,
    });
  } catch (error) {
    if (error instanceof OtpCooldownError) {
      return NextResponse.json(
        { ok: false, message: error.message, retryAfter: error.retryAfter },
        { status: 429 },
      );
    }

    console.error("Erro ao cadastrar lead:", error);
    return NextResponse.json(
      { ok: false, message: "Não foi possível concluir o cadastro agora." },
      { status: 500 },
    );
  }
}
