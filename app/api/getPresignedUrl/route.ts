import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { presignedUrlSchema } from '@/lib/server/validation';
import { buildObjectKey, getStorageGateway, isAllowedContentType } from '@/lib/server/storage';
import { AppError } from '@/lib/server/http';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    const body = presignedUrlSchema.parse(await req.json());
    if (!isAllowedContentType(body.fileType, body.contentType)) {
      throw new AppError('BAD_REQUEST', 'Invalid content type for file type');
    }
    // Owner-scoped key prevents any-user overwrite of victim UUIDs.
    const filename = buildObjectKey(body.fileType, userId, body.id);
    const storage = getStorageGateway();
    const presignedUrl = await storage.getUploadUrl(filename, body.contentType);
    return NextResponse.json({ presignedUrl, url: storage.getPublicUrl(filename) });
  } catch (error) {
    return handleRouteError(error, 'POST /api/getPresignedUrl');
  }
}
