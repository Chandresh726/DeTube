import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./env";

const idParam = z.coerce.number().int().positive();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const userIdSchema = idParam;
export const channelIdSchema = idParam;

/** Lamports as positive integer. Accepts number|string|bigint, returns bigint. */
export const lamportsSchema = z
  .union([z.number(), z.string(), z.bigint()])
  .refine((v) => {
    try {
      const b = BigInt(v as string);
      return b > 0n && b <= BigInt(Number.MAX_SAFE_INTEGER);
    } catch {
      return false;
    }
  }, "amount must be a positive integer in lamports")
  .transform((v) => BigInt(v as string));

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  name: text(1, 80),
});

export const channelRegisterSchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  channelName: text(1, 80),
  description: text(1, 1000),
  logo: z.string().trim().url().max(2048),
});

export const videoAddSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  videoId: z.string().trim().uuid().max(64),
  title: text(1, 160),
  description: text(0, 5000).optional().default(""),
  thumbnail: z.string().trim().url().max(2048),
  video: z.string().trim().url().max(2048),
});

export const commentAddSchema = z.object({
  videoId: z.string().trim().min(1).max(64),
  userId: z.union([z.number(), z.string()]).optional(),
  content: text(1, 5000),
});

export const reactionSetSchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  videoId: z.string().trim().min(1).max(64),
  type: z.enum(["LIKE", "DISLIKE"]),
});

export const reactionLegacySchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  videoId: z.string().trim().min(1).max(64),
  status: z.enum(["check", "like", "dislike", "remove"]),
});

export const subscribeSchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  channelId: z.coerce.number().int().positive(),
  status: z.enum(["check", "sub", "unsub"]),
});

export const thanksSchema = z.object({
  amount: lamportsSchema,
  userId: z.union([z.number(), z.string()]).optional(),
  channelId: z.coerce.number().int().positive(),
});

export const walletVerifySchema = z.object({
  publicKey: z.string().trim().min(32).max(64),
  signature: z.string().trim().min(64).max(128),
  message: z.string().trim().min(1).max(512),
  userId: z.union([z.number(), z.string()]).optional(),
});

export const walletCheckSchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  publicKey: z.string().trim().min(32).max(64),
});

export const depositSchema = z.object({
  address: z.string().trim().min(32).max(64),
  amount: lamportsSchema,
  signature: z.string().trim().min(64).max(128),
});

export const withdrawSchema = z.object({
  userId: z.union([z.number(), z.string()]).optional(),
  walletAddress: z.string().trim().min(32).max(64),
  amount: lamportsSchema,
});

export const presignedUrlSchema = z.object({
  fileType: z.enum(["thumbnail", "temp-video", "channel-logo"]),
  id: z.string().trim().uuid(),
  contentType: z.string().trim().min(3).max(128),
});

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
