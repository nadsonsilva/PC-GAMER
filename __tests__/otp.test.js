const {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  attemptsRemaining,
  generateOtp,
  hashOtp,
  isOtpExpired,
  otpExpiresAt,
  secondsUntilResend,
  verifyOtpHash,
} = require("../src/lib/otp");

describe("OTP", () => {
  beforeAll(() => {
    process.env.OTP_HASH_SECRET = "segredo-de-teste-com-tamanho-suficiente";
  });

  test("gera um código numérico de 6 dígitos", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  test("armazena e valida apenas o hash do código", () => {
    const code = "123456";
    const hashed = hashOtp(code);
    expect(hashed).not.toBe(code);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyOtpHash(code, hashed)).toBe(true);
    expect(verifyOtpHash("654321", hashed)).toBe(false);
  });

  test("define expiração em 10 minutos", () => {
    const now = new Date("2026-09-22T12:00:00.000Z");
    expect(otpExpiresAt(now).getTime() - now.getTime()).toBe(OTP_TTL_MS);
    expect(isOtpExpired(new Date(now.getTime() - 1), now)).toBe(true);
    expect(isOtpExpired(new Date(now.getTime() + 1), now)).toBe(false);
  });

  test("aplica cooldown de 60 segundos para reenvio", () => {
    const createdAt = new Date("2026-09-22T12:00:00.000Z");
    expect(OTP_RESEND_COOLDOWN_MS).toBe(60_000);
    expect(secondsUntilResend(createdAt, new Date("2026-09-22T12:00:15.000Z"))).toBe(45);
    expect(secondsUntilResend(createdAt, new Date("2026-09-22T12:01:01.000Z"))).toBe(0);
  });

  test("mantém limite de cinco tentativas", () => {
    expect(OTP_MAX_ATTEMPTS).toBe(5);
    expect(attemptsRemaining(0)).toBe(5);
    expect(attemptsRemaining(4)).toBe(1);
    expect(attemptsRemaining(5)).toBe(0);
  });
});
