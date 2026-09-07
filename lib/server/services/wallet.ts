import nacl from "tweetnacl";
import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import prisma from "@/app/api/util/prisma";
import { AppError } from "../http";
import { env } from "../env";
import { getSolanaGateway } from "../solana";

function decodeBase58(value: string, label: string): Uint8Array {
  try {
    return bs58.decode(value);
  } catch {
    throw new AppError("BAD_REQUEST", `Invalid ${label} encoding`);
  }
}

export const walletService = {
  async verifyOwnership(userId: number, input: { publicKey: string; signature: string; message: string }) {
    const publicKeyBytes = decodeBase58(input.publicKey, "publicKey");
    const signatureBytes = decodeBase58(input.signature, "signature");
    if (publicKeyBytes.length !== 32) throw new AppError("BAD_REQUEST", "Invalid publicKey length");
    if (signatureBytes.length !== 64) throw new AppError("BAD_REQUEST", "Invalid signature length");

    let valid = false;
    try {
      valid = nacl.sign.detached.verify(
        new TextEncoder().encode(input.message),
        Uint8Array.from(signatureBytes),
        Uint8Array.from(publicKeyBytes),
      );
    } catch {
      throw new AppError("BAD_REQUEST", "Signature verification failed");
    }
    if (!valid) throw new AppError("UNAUTHORIZED", "Signature verification failed");

    // NOTE: message should be a server-issued challenge (nonce+expiry+user binding).
    // We verify the cryptographic signature here; callers should migrate to
    // challenge-based messages to prevent replays (see audit notes).
    const existing = await prisma.wallet.findUnique({ where: { address: input.publicKey } });
    if (existing) {
      if (existing.userId !== userId) throw new AppError("CONFLICT", "Wallet already linked to another user");
      return { status: "exists" as const };
    }
    try {
      await prisma.wallet.create({ data: { address: input.publicKey, userId } });
    } catch (e: unknown) {
      const { Prisma } = await import("@/app/generated/prisma/client");
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const row = await prisma.wallet.findUnique({ where: { address: input.publicKey } });
        if (row && row.userId !== userId) throw new AppError("CONFLICT", "Wallet already linked to another user");
        return { status: "exists" as const };
      }
      throw e;
    }
    return { status: "created" as const };
  },

  async check(userId: number, publicKey: string) {
    const wallet = await prisma.wallet.findUnique({ where: { address: publicKey } });
    if (!wallet || wallet.userId !== userId) return { walletExists: false };
    return { walletExists: true, walletId: wallet.id };
  },

  async getBalance(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, lockedBalance: true },
    });
    if (!user) throw new AppError("NOT_FOUND", "User not found");
    return { balance: user.balance.toString(), lockedBalance: user.lockedBalance.toString() };
  },

  async getStatement(userId: number) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        signature: true,
        createdAt: true,
        channelId: true,
        walletId: true,
      },
    });
    const shaped = transactions.map((t) => ({
      id: t.id,
      amount: t.amount.toString(),
      type: t.type,
      status: t.status,
      signature: t.signature,
      createdAt: t.createdAt,
      channelId: t.channelId,
      walletId: t.walletId,
    }));
    return {
      DEPOSIT: shaped.filter((t) => t.type === "DEPOSIT"),
      WITHDRAWAL: shaped.filter((t) => t.type === "WITHDRAWAL"),
      THANKS: shaped.filter((t) => t.type === "THANKS"),
    };
  },

  /**
   * Secure deposit: verifies on-chain transfer to the central vault before
   * crediting. Idempotent on signature (unique constraint).
   */
  async deposit(userId: number, input: { address: string; amount: bigint; signature: string }) {
    const wallet = await prisma.wallet.findUnique({ where: { address: input.address } });
    if (!wallet || wallet.userId !== userId) throw new AppError("NOT_FOUND", "Wallet not found");

    const seen = await prisma.transaction.findUnique({ where: { signature: input.signature } });
    if (seen) {
      if (seen.status === "SUCCESS") return { status: "SUCCESS" as const, replayed: true };
      throw new AppError("CONFLICT", "Signature already processed");
    }

    const central = web3.Keypair.fromSecretKey(
      Uint8Array.from(decodeBase58(env.centralWalletPrivateKey, "central wallet key")),
    );
    const gateway = getSolanaGateway();
    const proof = await gateway.getParsedTransfer({
      signature: input.signature,
      expectedRecipient: central.publicKey.toBase58(),
      expectedLamports: input.amount,
    });

    const status = proof.ok ? "SUCCESS" : "FAILED";
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: input.amount,
          type: "DEPOSIT",
          status,
          signature: input.signature,
        },
      });
      if (status === "SUCCESS") {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: input.amount } },
        });
      }
    });
    return { status, replayed: false };
  },

  /**
   * Secure withdraw: conditional debit first (prevents TOCTOU overdraft),
   * then chain send, then log. Retries need idempotency keys (future work).
   */
  async withdraw(userId: number, input: { walletAddress: string; amount: bigint }) {
    const wallet = await prisma.wallet.findUnique({ where: { address: input.walletAddress } });
    if (!wallet || wallet.userId !== userId) throw new AppError("NOT_FOUND", "Wallet not found");

    // Atomic guard: only debit if balance >= amount.
    const debit = await prisma.user.updateMany({
      where: { id: userId, balance: { gte: input.amount } },
      data: { balance: { decrement: input.amount } },
    });
    if (debit.count === 0) {
      const exists = await prisma.user.findUnique({ where: { id: userId } });
      if (!exists) throw new AppError("NOT_FOUND", "User not found");
      throw new AppError("BAD_REQUEST", "Insufficient balance");
    }

    const connection = new web3.Connection(env.solanaRpcUrl, "confirmed");
    const centralWallet = web3.Keypair.fromSecretKey(
      Uint8Array.from(decodeBase58(env.centralWalletPrivateKey, "central wallet key")),
    );
    const tx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: centralWallet.publicKey,
        toPubkey: new web3.PublicKey(input.walletAddress),
        lamports: Number(input.amount),
      }),
    );

    try {
      const signature = await web3.sendAndConfirmTransaction(connection, tx, [centralWallet]);
      await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: input.amount,
          type: "WITHDRAWAL",
          status: "SUCCESS",
          signature,
        },
      });
      return { signature };
    } catch (e) {
      // Refund on chain failure so ledger stays consistent.
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: input.amount } } });
      await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: input.amount,
          type: "WITHDRAWAL",
          status: "FAILED",
          signature: null,
        },
      });
      throw new AppError("INTERNAL", "Withdrawal failed");
    }
  },

  /** Atomic thanks: guarded debit + credit in one interactive transaction. */
  async thanks(fromUserId: number, input: { channelId: number; amount: bigint }) {
    const channel = await prisma.channel.findUnique({ where: { id: input.channelId } });
    if (!channel) throw new AppError("NOT_FOUND", "Channel not found");
    if (channel.userId === fromUserId) throw new AppError("BAD_REQUEST", "Cannot tip your own channel");

    await prisma.$transaction(async (tx) => {
      const debit = await tx.user.updateMany({
        where: { id: fromUserId, balance: { gte: input.amount } },
        data: { balance: { decrement: input.amount } },
      });
      if (debit.count === 0) throw new AppError("BAD_REQUEST", "Insufficient balance");
      await tx.user.update({
        where: { id: channel.userId },
        data: { balance: { increment: input.amount } },
      });
      await tx.transaction.create({
        data: {
          userId: fromUserId,
          channelId: input.channelId,
          amount: input.amount,
          type: "THANKS",
          status: "SUCCESS",
        },
      });
    });
  },
};
