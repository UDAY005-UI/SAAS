/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[captureId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payerEmail]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `captureId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payerEmail` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Payment_transactionId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "transactionId",
ADD COLUMN     "captureId" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "payerEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_captureId_key" ON "Payment"("captureId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payerEmail_key" ON "Payment"("payerEmail");
