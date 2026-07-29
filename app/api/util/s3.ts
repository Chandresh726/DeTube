import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const region = "ap-south-1"
const bucketName = "next-youtube"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
})

export async function generatePreSignedURL(fileName: string) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    })

    return getSignedUrl(s3, command, { expiresIn: 60 * 10 })
}
