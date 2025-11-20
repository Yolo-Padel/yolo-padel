-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "qrImageUrl" TEXT,
ADD COLUMN     "qrString" TEXT,
ADD COLUMN     "xenditInvoiceId" TEXT,
ADD COLUMN     "xenditMetadata" JSONB,
ADD COLUMN     "xenditPaymentRequestId" TEXT,
ADD COLUMN     "xenditReferenceId" TEXT;

-- CreateIndex
CREATE INDEX "payments_xenditPaymentRequestId_idx" ON "payments"("xenditPaymentRequestId");

-- CreateIndex
CREATE INDEX "payments_xenditInvoiceId_idx" ON "payments"("xenditInvoiceId");
