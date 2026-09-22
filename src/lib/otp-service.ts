import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp, hashOtp, otpExpiresAt, secondsUntilResend } from "@/lib/otp";

export class OtpCooldownError extends Error {
  constructor(public retryAfter: number) {
    super(`Aguarde ${retryAfter}s para solicitar outro código.`);
  }
}

export async function issueOtp(leadId: string, email: string) {
  const latest = await prisma.otp.findFirst({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latest) {
    const retryAfter = secondsUntilResend(latest.createdAt);
    if (retryAfter > 0) throw new OtpCooldownError(retryAfter);
  }

  const code = generateOtp();
  const now = new Date();

  const otp = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.otp.updateMany({
      where: { leadId, usedAt: null, invalidatedAt: null },
      data: { invalidatedAt: now },
    });

    return tx.otp.create({
      data: {
        leadId,
        codeHash: hashOtp(code),
        expiresAt: otpExpiresAt(now),
      },
    });
  });

  try {
    await sendOtpEmail(email, code);
  } catch (error) {
    await prisma.otp.update({ where: { id: otp.id }, data: { invalidatedAt: new Date() } });
    console.error("Falha ao enviar OTP:", error);
    throw new Error("Não foi possível enviar o código de verificação.");
  }

  return { expiresIn: 600, resendIn: 60 };
}
