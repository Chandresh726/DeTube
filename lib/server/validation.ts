import { z } from 'zod';
import bs58 from 'bs58';
import {
  DEFAULT_PAGE_SIZE,
  FEED_DEFAULT_PAGE_SIZE,
  MAX_CHANNEL_LOGO_BYTES,
  MAX_PAGE_SIZE,
  MAX_THUMBNAIL_BYTES,
  MAX_VIDEO_BYTES,
} from './env';

const idParam = z.coerce.number().int().positive();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const feedPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(FEED_DEFAULT_PAGE_SIZE),
});

export const userIdSchema = idParam;
export const channelIdSchema = idParam;

function isBase58(value: string): boolean {
  try {
    bs58.decode(value);
    return true;
  } catch {
    return false;
  }
}

const base58String = (min: number, max: number) =>
  z.string().trim().min(min).max(max).refine(isBase58, 'must be base58-encoded');

/** Lamports as positive integer. Accepts number|string|bigint, returns bigint. */
export const lamportsSchema = z
  .union([z.bigint(), z.string().trim().min(1), z.number()])
  .refine((v) => {
    if (typeof v === 'number') {
      return Number.isInteger(v) && v > 0 && v <= Number.MAX_SAFE_INTEGER;
    }
    try {
      const b = typeof v === 'bigint' ? v : BigInt(v as string);
      return b > 0n && b <= BigInt(Number.MAX_SAFE_INTEGER);
    } catch {
      return false;
    }
  }, 'amount must be a positive integer in lamports')
  .transform((v) => (typeof v === 'bigint' ? v : typeof v === 'number' ? BigInt(v) : BigInt(v as string)));

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

/** Legacy client-supplied user id: accepted during migration, must match session. */
export const legacyUserId = z
  .union([z.number().int().positive(), z.string().trim().regex(/^\d+$/)])
  .optional();

export const videoIdString = z.string().trim().min(1).max(64);
export const publicKeyString = base58String(32, 64);
export const signatureString = base58String(64, 128);

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  name: text(1, 80),
});

export const channelRegisterSchema = z.object({
  userId: legacyUserId,
  channelName: text(1, 80),
  description: text(1, 1000),
  logo: z.string().trim().url().max(2048),
});

export const videoAddSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  videoId: z.string().trim().uuid().max(64),
  title: text(1, 160),
  description: text(0, 5000).optional().default(''),
  thumbnail: z.string().trim().url().max(2048),
  video: z.string().trim().url().max(2048),
});

export const commentAddSchema = z.object({
  videoId: videoIdString,
  userId: legacyUserId,
  content: text(1, 5000),
});

export const reactionSetSchema = z.object({
  userId: legacyUserId,
  videoId: videoIdString,
  type: z.enum(['LIKE', 'DISLIKE']),
});

export const reactionLegacySchema = z.object({
  userId: legacyUserId,
  videoId: videoIdString,
  status: z.enum(['check', 'like', 'dislike', 'remove']),
});

export const subscribeSchema = z.object({
  userId: legacyUserId,
  channelId: z.coerce.number().int().positive(),
  status: z.enum(['check', 'sub', 'unsub']),
});

export const thanksSchema = z.object({
  amount: lamportsSchema,
  userId: legacyUserId,
  channelId: z.coerce.number().int().positive(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

export const walletVerifySchema = z.object({
  publicKey: publicKeyString,
  signature: signatureString,
  message: z.string().trim().min(1).max(512),
  userId: legacyUserId,
});

export const walletCheckSchema = z.object({
  userId: legacyUserId,
  publicKey: publicKeyString,
});

export const depositSchema = z.object({
  address: publicKeyString,
  amount: lamportsSchema,
  signature: signatureString,
});

export const withdrawSchema = z.object({
  userId: legacyUserId,
  walletAddress: publicKeyString,
  amount: lamportsSchema,
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

const contentTypeString = z.string().trim().min(3).max(128);

export const MAX_UPLOAD_BYTES_BY_FILE_TYPE: Record<string, number> = {
  thumbnail: MAX_THUMBNAIL_BYTES,
  'channel-logo': MAX_CHANNEL_LOGO_BYTES,
  'temp-video': MAX_VIDEO_BYTES,
};

export const presignedUrlSchema = z
  .object({
    fileType: z.enum(['thumbnail', 'temp-video', 'channel-logo']),
    id: z.string().trim().uuid(),
    contentType: contentTypeString,
    contentLength: z.coerce.number().int().positive().optional(),
  })
  .superRefine((v, ctx) => {
    const cap = MAX_UPLOAD_BYTES_BY_FILE_TYPE[v.fileType];
    if (v.contentLength !== undefined && cap !== undefined && v.contentLength > cap) {
      ctx.addIssue({
        code: 'custom',
        message: `contentLength exceeds ${cap} bytes for ${v.fileType}`,
      });
    }
  });

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
