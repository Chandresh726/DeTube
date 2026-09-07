-- Backend hardening: composite indexes, Restrict deletes for money trail, withdraw idempotency

-- Alter Channel.name / Video.title to bounded varchar (compatible narrowing, no data loss expected)
ALTER TABLE "Channel" ALTER COLUMN "name" SET DATA TYPE VARCHAR(80);
ALTER TABLE "Video" ALTER COLUMN "title" SET DATA TYPE VARCHAR(160);

-- Add withdraw idempotency key
ALTER TABLE "Transaction" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- Drop low-selectivity / redundant single-column indexes
DROP INDEX IF EXISTS "Subscription_userId_idx";
DROP INDEX IF EXISTS "Reaction_videoId_idx";
DROP INDEX IF EXISTS "Reaction_userId_idx";
DROP INDEX IF EXISTS "Comment_videoId_idx";
DROP INDEX IF EXISTS "Transaction_status_idx";
DROP INDEX IF EXISTS "Transaction_type_idx";
DROP INDEX IF EXISTS "Transaction_userId_idx";
DROP INDEX IF EXISTS "Transaction_channelId_idx";

-- Create composite indexes for hot paginated paths
CREATE INDEX "Video_createdAt_idx" ON "Video"("createdAt" DESC);
CREATE INDEX "Video_channelId_createdAt_idx" ON "Video"("channelId", "createdAt" DESC);
CREATE INDEX "Video_updatedAt_idx" ON "Video"("updatedAt" DESC);
CREATE INDEX "Channel_updatedAt_idx" ON "Channel"("updatedAt" DESC);
CREATE INDEX "Reaction_videoId_type_idx" ON "Reaction"("videoId", "type");
CREATE INDEX "Reaction_userId_type_createdAt_idx" ON "Reaction"("userId", "type", "createdAt" DESC);
CREATE INDEX "Comment_videoId_createdAt_idx" ON "Comment"("videoId", "createdAt" DESC);
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt" DESC);
CREATE INDEX "Transaction_channelId_type_status_idx" ON "Transaction"("channelId", "type", "status");
CREATE INDEX "Transaction_userId_type_status_createdAt_idx" ON "Transaction"("userId", "type", "status", "createdAt" DESC);

-- Harden delete rules: Channel owner + money trail must not cascade-delete silently
ALTER TABLE "Channel" DROP CONSTRAINT IF EXISTS "Channel_userId_fkey";
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_userId_fkey";
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Safety: ledger amounts must never go negative via direct SQL
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_amount_positive') THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_positive" CHECK ("amount" > 0);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_balance_nonnegative') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_balance_nonnegative" CHECK ("balance" >= 0);
  END IF;
END $$;
