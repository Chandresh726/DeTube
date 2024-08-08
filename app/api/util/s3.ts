import aws from 'aws-sdk'

const region = "ap-south-1"
const bucketName = "next-youtube"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string

const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey
})

export async function generatePreSignedURL(fileName: String) {
    const params = ({
        Bucket: bucketName,
        Key: fileName,
        Expires: (60 * 10) // 10min
    })
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return uploadURL
}