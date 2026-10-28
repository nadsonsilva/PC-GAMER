-- Semana 4: dados de checkout e acompanhamento do pagamento.
ALTER TABLE "Order" ADD COLUMN "preferenceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "checkoutUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "lastPaymentStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentUpdatedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");
