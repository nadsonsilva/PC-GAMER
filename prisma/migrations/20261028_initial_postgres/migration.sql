-- Initial PostgreSQL schema for PC GAMER (Prisma models)
CREATE TABLE "Lead" (
 "id" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "whatsapp" TEXT NOT NULL,
 "cep" TEXT NOT NULL,
 "address" TEXT,
 "verifiedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Otp" (
 "id" TEXT NOT NULL,
 "leadId" TEXT NOT NULL,
 "codeHash" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "attempts" INTEGER NOT NULL DEFAULT 0,
 "usedAt" TIMESTAMP(3),
 "invalidatedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Order" (
 "number" SERIAL NOT NULL,
 "id" TEXT NOT NULL,
 "leadId" TEXT NOT NULL,
 "amountCents" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
 "preferenceId" TEXT,
 "checkoutUrl" TEXT,
 "paymentId" TEXT,
 "lastPaymentStatus" TEXT,
 "paymentUpdatedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 "paidAt" TIMESTAMP(3),
 "confirmationEmailSentAt" TIMESTAMP(3),
 "confirmationEmailClaimedAt" TIMESTAMP(3),
 CONSTRAINT "Order_pkey" PRIMARY KEY ("number")
);
CREATE TABLE "AnalyticsEvent" (
 "id" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
CREATE INDEX "Otp_leadId_createdAt_idx" ON "Otp"("leadId", "createdAt");
CREATE UNIQUE INDEX "Order_id_key" ON "Order"("id");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
