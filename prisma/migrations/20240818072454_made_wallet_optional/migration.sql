-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_walletId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "walletId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
