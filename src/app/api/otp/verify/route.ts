import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OTP_MAX_ATTEMPTS, attemptsRemaining, isOtpExpired, verifyOtpHash } from "@/lib/otp";
import { verifyOtpSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = verifyOtpSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const { email, code } = parsed.data;
    const lead = await prisma.lead.findUnique({ where: { email } });
    if (!lead) {
      return NextResponse.json({ ok: false, message: "Código inválido ou expirado." }, { status: 400 });
    }

    const otp = await prisma.otp.findFirst({
      where: { leadId: lead.id, usedAt: null, invalidatedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ ok: false, message: "Código inválido ou expirado." }, { status: 400 });
    }

    if (isOtpExpired(otp.expiresAt)) {
      await prisma.otp.update({ where: { id: otp.id }, data: { invalidatedAt: new Date() } });
      return NextResponse.json({ ok: false, message: "O código expirou. Solicite um novo." }, { status: 400 });
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.otp.update({ where: { id: otp.id }, data: { invalidatedAt: new Date() } });
      return NextResponse.json(
        { ok: false, message: "Limite de tentativas atingido. Solicite um novo código." },
        { status: 429 },
      );
    }

    if (!verifyOtpHash(code, otp.codeHash)) {
      const attempts = otp.attempts + 1;
      const blocked = attempts >= OTP_MAX_ATTEMPTS;
      await prisma.otp.update({
        where: { id: otp.id },
        data: { attempts, invalidatedAt: blocked ? new Date() : null },
      });

      return NextResponse.json(
        {
          ok: false,
          message: blocked
            ? "Limite de tentativas atingido. Solicite um novo código."
            : "Código incorreto.",
          attemptsRemaining: attemptsRemaining(attempts),
        },
        { status: blocked ? 429 : 400 },
      );
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.otp.update({ where: { id: otp.id }, data: { usedAt: now } }),
      prisma.lead.update({ where: { id: lead.id }, data: { verifiedAt: now } }),
    ]);

    return NextResponse.json({ ok: true, message: "E-mail validado com sucesso." });
  } catch (error) {
    console.error("Erro ao validar OTP:", error);
    return NextResponse.json({ ok: false, message: "Não foi possível validar o código." }, { status: 500 });
  }
}
