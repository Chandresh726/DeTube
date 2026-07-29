import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 10

let r2Client: S3Client | undefined

function getRequiredEnvironmentVariable(name: string) {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

function getR2Client() {
    if (!r2Client) {
        const accountId = getRequiredEnvironmentVariable('R2_ACCOUNT_ID')

        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: getRequiredEnvironmentVariable('R2_ACCESS_KEY_ID'),
                secretAccessKey: getRequiredEnvironmentVariable('R2_SECRET_ACCESS_KEY'),
            },
        })
    }

    return r2Client
}

export async function generatePreSignedURL(fileName: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: getRequiredEnvironmentVariable('R2_BUCKET_NAME'),
        Key: fileName,
        ContentType: contentType,
    })

    return getSignedUrl(getR2Client(), command, {
        expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    })
}

export function getPublicR2URL(fileName: string) {
    const publicURL = getRequiredEnvironmentVariable('R2_PUBLIC_URL').replace(/\/+$/, '')
    return `${publicURL}/${fileName}`
}
