/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "channelId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_channelId_key" ON "User"("channelId");
