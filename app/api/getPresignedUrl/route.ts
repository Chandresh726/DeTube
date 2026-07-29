import { NextRequest, NextResponse } from 'next/server';
import { generatePreSignedURL, getPublicR2URL } from '../util/r2';
import { authenticateUser } from '../middleware/auth';

const mediaFileTypes = ['thumbnail', 'temp-video', 'channel-logo'] as const;
type MediaFileType = typeof mediaFileTypes[number];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMediaFileType(value: unknown): value is MediaFileType {
    return typeof value === 'string' && mediaFileTypes.includes(value as MediaFileType);
}

function isAllowedContentType(fileType: MediaFileType, contentType: string) {
    if (fileType === 'temp-video') {
        return contentType.startsWith('video/');
    }

    return contentType.startsWith('image/');
}

export async function POST(req: NextRequest) {
    const session = await authenticateUser(req);
    if (session instanceof NextResponse) {
        return session;
    }

    try {
        const { fileType, id, contentType } = await req.json();

        if (
            !isMediaFileType(fileType)
            || typeof id !== 'string'
            || !uuidPattern.test(id)
            || typeof contentType !== 'string'
            || !isAllowedContentType(fileType, contentType)
        ) {
            return NextResponse.json({ error: 'Invalid media upload request' }, { status: 400 });
        }

        const filename = `${fileType}/${id}`;
        const url = await generatePreSignedURL(filename, contentType);
        const publicUrl = getPublicR2URL(filename);

        return NextResponse.json({ presignedUrl: url, url: publicUrl });
    } catch (error) {
        console.error('Error generating R2 presigned URL:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
