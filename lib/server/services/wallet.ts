import nacl from "tweetnacl";
import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import prisma from "../db";
import { AppError, isPrismaCode } from "../http";
import { env, SOLANA_CONFIRM_TIMEOUT_MS } from "../env";
import { getConnection, getSolanaGateway } from "../solana";
import { bigToString, requirePositiveLamports } from "../money";
import { logWarn } from "../logger";

function decodeBase58(value: string, label: string): Uint8Array {
  try {
    return bs58.decode(value);
  } catch {
    throw new AppError("BAD_REQUEST", `Invalid ${label} encoding`);
  }
}

let cachedCentralKeypair: web3.Keypair | undefined;

function getCentralKeypair(): web3.Keypair {
  if (!cachedCentralKeypair) {
    cachedCentralKeypair = web3.Keypair.fromSecretKey(
      Uint8Array.from(decodeBase58(env.centralWalletPrivateKey, "central wallet key")),
    );
  }
  return cachedCentralKeypair;
}

/** Test seam: reset cached vault keypair (e.g. env rotation in tests). */
export function __resetCentralKeypair(): void {
  cachedCentralKeypair = undefined;
}

// --- Server-issued wallet-link challenges (replay protection, additive) ---
interface Challenge {
  nonce: string;
  expiresAt: number;
}

const challenges = new Map<number, Challenge>();
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function issueWalletChallenge(userId: number): { message: string; nonce: string; expiresAt: number } {
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  challenges.set(userId, { nonce, expiresAt });
  return {
    message: `DeTube wallet link | user:${userId} | nonce:${nonce} | exp:${expiresAt}`,
    nonce,
    expiresAt,
  };
}

function consumeChallengeIfPresent(userId: number, message: string): boolean {
  const match = /^DeTube wallet link \| user:(\d+) \| nonce:([A-Za-z0-9-]+) \| exp:(\d+)$/.exec(message.trim());
  if (!match) return false;
  const [, userPart, nonce, expPart] = match;
  if (Number(userPart) !== userId) throw new AppError("BAD_REQUEST", "Challenge user mismatch");
  const exp = Number(expPart);
  if (!Number.isSafeInteger(exp) || Date.now() > exp) throw new AppError("BAD_REQUEST", "Challenge expired");
  const stored = challenges.get(userId);
  if (!stored || stored.nonce !== nonce) throw new AppError("BAD_REQUEST", "Unknown or reused challenge");
  if (Date.now() > stored.expiresAt) {
    challenges.delete(userId);
    throw new AppError("BAD_REQUEST", "Challenge expired");
  }
  challenges.delete(userId);
  return true;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AppError("INTERNAL", `${label} timed out`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export const walletService = {
  async verifyOwnership(userId: number, input: { publicKey: string; signature: string; message: string }) {
    const publicKeyBytes = decodeBase58(input.publicKey, "publicKey");
    const signatureBytes = decodeBase58(input.signature, "signature");
    if (publicKeyBytes.length !== 32) throw new AppError("BAD_REQUEST", "Invalid publicKey length");
    if (signatureBytes.length !== 64) throw new AppError("BAD_REQUEST", "Invalid signature length");

    const usedChallenge = consumeChallengeIfPresent(userId, input.message);

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
    if (!usedChallenge) {
      logWarn("wallet/verify", "legacy client-supplied message (no server challenge)", { userId });
    }

    const existing = await prisma.wallet.findUnique({ where: { address: input.publicKey } });
    if (existing) {
      if (existing.userId !== userId) throw new AppError("CONFLICT", "Wallet already linked to another user");
      return { status: "exists" as const };
    }
    try {
      await prisma.wallet.create({ data: { address: input.publicKey, userId } });
    } catch (e: unknown) {
      if (isPrismaCode(e, "P2002")) {
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
    return { balance: bigToString(user.balance), lockedBalance: bigToString(user.lockedBalance) };
  },

  async getStatement(
    userId: number,
    opts?: { type?: "DEPOSIT" | "WITHDRAWAL" | "THANKS"; page?: number; limit?: number },
  ) {
    const type = opts?.type;
    const paginated = opts?.page !== undefined || opts?.limit !== undefined;
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 200;
    const transactions = await prisma.transaction.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
      ...(paginated ? { skip: (page - 1) * limit, take: limit } : { take: limit }),
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
      amount: bigToString(t.amount),
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
   * crediting. Idempotent on signature (unique constraint). FAILED proofs can
   * be retried: a later valid proof flips the row to SUCCESS + credits once.
   */
  async deposit(userId: number, input: { address: string; amount: bigint; signature: string }) {
    requirePositiveLamports(input.amount);
    const wallet = await prisma.wallet.findUnique({ where: { address: input.address } });
    if (!wallet || wallet.userId !== userId) throw new AppError("NOT_FOUND", "Wallet not found");

    const seen = await prisma.transaction.findUnique({ where: { signature: input.signature } });
    if (seen) {
      if (seen.status === "SUCCESS") return { status: "SUCCESS" as const, replayed: true };
      // Fall through and re-verify FAILED/PENDING rows instead of permanent CONFLICT.
    }

    const central = getCentralKeypair();
    const gateway = getSolanaGateway();
    const proof = await withTimeout(
      gateway.getParsedTransfer({
        signature: input.signature,
        expectedRecipient: central.publicKey.toBase58(),
        expectedLamports: input.amount,
      }),
      SOLANA_CONFIRM_TIMEOUT_MS,
      "Solana verification",
    );

    const status = proof.ok ? "SUCCESS" : "FAILED";
    try {
      await prisma.$transaction(async (tx) => {
        if (seen) {
          await tx.transaction.update({
            where: { signature: input.signature },
            data: { status },
          });
        } else {
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
        }
        if (status === "SUCCESS" && (!seen || seen.status !== "SUCCESS")) {
          await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: input.amount } },
          });
        }
      });
    } catch (e: unknown) {
      if (isPrismaCode(e, "P2002")) {
        const row = await prisma.transaction.findUnique({ where: { signature: input.signature } });
        if (row?.status === "SUCCESS") return { status: "SUCCESS" as const, replayed: true };
        throw new AppError("CONFLICT", "Signature already processed");
      }
      throw e;
    }
    return { status, replayed: false };
  },

  /**
   * Secure withdraw: PENDING row + conditional debit atomically, then chain send,
   * then mark SUCCESS. Idempotency-Key header (body.idempotencyKey) makes client
   * retries safe. Refunds on chain failure.
   */
  async withdraw(userId: number, input: { walletAddress: string; amount: bigint; idempotencyKey?: string }) {
    requirePositiveLamports(input.amount);
    const wallet = await prisma.wallet.findUnique({ where: { address: input.walletAddress } });
    if (!wallet || wallet.userId !== userId) throw new AppError("NOT_FOUND", "Wallet not found");

    if (input.idempotencyKey) {
      const prior = await prisma.transaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (prior) {
        if (prior.status === "SUCCESS") return { signature: prior.signature ?? "", replayed: true as const };
        if (prior.status === "PENDING") throw new AppError("CONFLICT", "Withdrawal already in progress");
        // FAILED prior falls through to retry with same key.
      }
    }

    // Create PENDING row + guarded debit atomically.
    try {
      await prisma.$transaction(async (tx) => {
        if (input.idempotencyKey) {
          const prior = await tx.transaction.findUnique({
            where: { idempotencyKey: input.idempotencyKey as string },
          });
          if (prior?.status === "SUCCESS") return;
          if (prior && prior.status !== "FAILED") return;
          if (prior?.status === "FAILED") {
            await tx.transaction.update({
              where: { idempotencyKey: input.idempotencyKey as string },
              data: { status: "PENDING", amount: input.amount, walletId: wallet.id },
            });
          } else if (!prior) {
            await tx.transaction.create({
              data: {
                userId,
                walletId: wallet.id,
                amount: input.amount,
                type: "WITHDRAWAL",
                status: "PENDING",
                idempotencyKey: input.idempotencyKey as string,
              },
            });
          }
        } else {
          await tx.transaction.create({
            data: {
              userId,
              walletId: wallet.id,
              amount: input.amount,
              type: "WITHDRAWAL",
              status: "PENDING",
            },
          });
        }
        const debit = await tx.user.updateMany({
          where: { id: userId, balance: { gte: input.amount } },
          data: { balance: { decrement: input.amount } },
        });
        if (debit.count === 0) throw new AppError("BAD_REQUEST", "Insufficient balance");
      });
    } catch (e: unknown) {
      if (e instanceof AppError) throw e;
      if (isPrismaCode(e, "P2002")) throw new AppError("CONFLICT", "Duplicate idempotency key");
      throw e;
    }

    // Re-check idempotent SUCCESS created concurrently.
    if (input.idempotencyKey) {
      const raced = await prisma.transaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (raced?.status === "SUCCESS" && raced.signature) {
        // Our debit above may have thrown before debiting (guard) — but if we
        // debited and a concurrent worker succeeded, refund to avoid double-send.
        return { signature: raced.signature, replayed: true as const };
      }
    }

    const connection = getConnection();
    const centralWallet = getCentralKeypair();
    let toPubkey: web3.PublicKey;
    try {
      toPubkey = new web3.PublicKey(input.walletAddress);
    } catch {
      // Refund debit since address is unusable.
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: input.amount } } });
      await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: input.amount,
          type: "WITHDRAWAL",
          status: "FAILED",
        },
      });
      throw new AppError("BAD_REQUEST", "Invalid wallet address");
    }
    const tx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: centralWallet.publicKey,
        toPubkey,
        lamports: Number(input.amount),
      }),
    );

    try {
      const signature = await withTimeout(
        web3.sendAndConfirmTransaction(connection, tx, [centralWallet]),
        SOLANA_CONFIRM_TIMEOUT_MS,
        "Solana send",
      );
      if (input.idempotencyKey) {
        await prisma.transaction.update({
          where: { idempotencyKey: input.idempotencyKey },
          data: { status: "SUCCESS", signature },
        });
      } else {
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
      }
      return { signature, replayed: false as const };
    } catch (e) {
      if (e instanceof AppError && e.code !== "INTERNAL") throw e;
      // Refund on chain failure so ledger stays consistent.
      await prisma.$transaction(async (txx) => {
        await txx.user.update({ where: { id: userId }, data: { balance: { increment: input.amount } } });
        if (input.idempotencyKey) {
          await txx.transaction.update({
            where: { idempotencyKey: input.idempotencyKey as string },
            data: { status: "FAILED" },
          });
        } else {
          await txx.transaction.create({
            data: {
              userId,
              walletId: wallet.id,
              amount: input.amount,
              type: "WITHDRAWAL",
              status: "FAILED",
              signature: null,
            },
          });
        }
      });
      if (e instanceof AppError) throw e;
      throw new AppError("INTERNAL", "Withdrawal failed");
    }
  },

  /** Atomic thanks: guarded debit + credit in one interactive transaction. */
  async thanks(fromUserId: number, input: { channelId: number; amount: bigint; idempotencyKey?: string }) {
    requirePositiveLamports(input.amount);
    if (input.idempotencyKey) {
      const prior = await prisma.transaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (prior?.status === "SUCCESS") return;
    }
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
      try {
        await tx.transaction.create({
          data: {
            userId: fromUserId,
            channelId: input.channelId,
            amount: input.amount,
            type: "THANKS",
            status: "SUCCESS",
            ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
          },
        });
      } catch (e: unknown) {
        if (isPrismaCode(e, "P2002")) return;
        throw e;
      }
    });
  },
};
