/*
  Warnings:

  - You are about to drop the column `channelId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_channelId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "channelId";
