import { NextRequest, NextResponse } from 'next/server';
import { generatePreSignedURL } from '../util/s3'

export async function POST(request: NextRequest) {
    const data = await request.json();
    const folder = data.fileType
    const filename = folder + "/" + data.id
    const url = await generatePreSignedURL(filename);
    const public_url = process.env.CLOUD_FRONT_DOMAIN + "/" + filename;
    return NextResponse.json({ presignedUrl: url, url: public_url });
}