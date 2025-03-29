import { NextRequest, NextResponse } from 'next/server';
import { generatePreSignedURL } from '../util/s3';
import { authenticateUser } from '../middleware/auth';

export async function POST(req: NextRequest) {
    const session = await authenticateUser(req);
    if (session instanceof NextResponse) {
        return session;
    }

    try {
        const data = await req.json();
        const folder = data.fileType;
        const filename = folder + "/" + data.id;
        const url = await generatePreSignedURL(filename);
        const public_url = process.env.CLOUD_FRONT_DOMAIN + "/" + filename;
        return NextResponse.json({ presignedUrl: url, url: public_url });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}