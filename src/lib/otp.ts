import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

function getSecret() {
  const secret = process.env.OTP_HASH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("OTP_HASH_SECRET não foi configurado.");
  }

  return "development-only-secret-change-me";
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(code: string) {
  return createHmac("sha256", getSecret()).update(code).digest("hex");
}

export function verifyOtpHash(code: string, expectedHash: string) {
  const actual = Buffer.from(hashOtp(code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}


export function attemptsRemaining(attempts: number) {
  return Math.max(0, OTP_MAX_ATTEMPTS - attempts);
}

export function otpExpiresAt(now = new Date()) {
  return new Date(now.getTime() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}

export function secondsUntilResend(createdAt: Date, now = new Date()) {
  const remaining = OTP_RESEND_COOLDOWN_MS - (now.getTime() - createdAt.getTime());
  return Math.max(0, Math.ceil(remaining / 1000));
}
