import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { MAX_UPLOAD_BYTES_BY_FILE_TYPE, presignedUrlSchema } from '@/lib/server/validation';
import { buildObjectKey, getStorageGateway, isAllowedContentType } from '@/lib/server/storage';
import { AppError } from '@/lib/server/http';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_PRESIGNED } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    rateLimitByUser('uploads:presigned', userId, RATE_LIMIT_MAX_PRESIGNED);
    const body = presignedUrlSchema.parse(await req.json());
    if (!isAllowedContentType(body.fileType, body.contentType)) {
      throw new AppError('BAD_REQUEST', 'Invalid content type for file type');
    }
    const cap = MAX_UPLOAD_BYTES_BY_FILE_TYPE[body.fileType];
    if (body.contentLength !== undefined && cap !== undefined && body.contentLength > cap) {
      throw new AppError('BAD_REQUEST', `File too large (max ${cap} bytes)`);
    }
    // Owner-scoped key prevents any-user overwrite of victim UUIDs.
    const filename = buildObjectKey(body.fileType, userId, body.id);
    const storage = getStorageGateway();
    const presignedUrl = await storage.getUploadUrl(filename, body.contentType, body.contentLength);
    return NextResponse.json({ presignedUrl, url: storage.getPublicUrl(filename) });
  } catch (error) {
    return handleRouteError(error, 'POST /api/getPresignedUrl');
  }
}
