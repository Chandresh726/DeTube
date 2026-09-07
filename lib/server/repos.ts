import prisma from "@/app/api/util/prisma";
import type { PrismaClient } from "@/app/generated/prisma/client";

export type Db = PrismaClient | Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Narrow repository ports (ISP): callers depend on these, not PrismaClient. */

export const userRepo = {
  async getById(db: Db, id: number) {
    const client = db as PrismaClient;
    return client.user.findUnique({ where: { id } });
  },
  async getBalance(db: Db, id: number) {
    const client = db as PrismaClient;
    return client.user.findUnique({
      where: { id },
      select: { balance: true, lockedBalance: true },
    });
  },
};

export const channelRepo = {
  async getById(db: Db, id: number) {
    const client = db as PrismaClient;
    return client.channel.findUnique({ where: { id } });
  },
  async getByUserId(db: Db, userId: number) {
    const client = db as PrismaClient;
    return client.channel.findUnique({ where: { userId } });
  },
};

export const videoRepo = {
  async getById(db: Db, id: string) {
    const client = db as PrismaClient;
    return client.video.findUnique({ where: { id } });
  },
};

export const walletRepo = {
  async getByAddress(db: Db, address: string) {
    const client = db as PrismaClient;
    return client.wallet.findUnique({ where: { address } });
  },
};
