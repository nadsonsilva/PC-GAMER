-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "number" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "preferenceId" TEXT,
    "checkoutUrl" TEXT,
    "paymentId" TEXT,
    "lastPaymentStatus" TEXT,
    "paymentUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    CONSTRAINT "Order_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amountCents", "checkoutUrl", "createdAt", "id", "lastPaymentStatus", "leadId", "number", "paidAt", "paymentId", "paymentUpdatedAt", "preferenceId", "status", "updatedAt") SELECT "amountCents", "checkoutUrl", "createdAt", "id", "lastPaymentStatus", "leadId", "number", "paidAt", "paymentId", "paymentUpdatedAt", "preferenceId", "status", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_id_key" ON "Order"("id");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
