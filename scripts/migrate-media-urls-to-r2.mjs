import 'dotenv/config'
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const SOURCE_MEDIA_URL = 'https://d699fes17772n.cloudfront.net'
const EXPECTED_COUNTS = {
    thumbnails: 16,
    videos: 16,
    channelLogos: 10,
}

let r2Client

function getRequiredEnvironmentVariable(name) {
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

function normalizeBaseURL(value) {
    return value.replace(/\/+$/, '')
}

function assertMediaURL(value, baseURL, prefix, label) {
    const expectedPrefix = `${baseURL}/${prefix}/`

    if (!value.startsWith(expectedPrefix)) {
        throw new Error(`${label} does not use the expected ${expectedPrefix} URL prefix`)
    }

    const objectKey = value.slice(baseURL.length + 1)
    const parsedURL = new URL(value)

    if (parsedURL.search || parsedURL.hash || parsedURL.pathname.slice(1) !== objectKey) {
        throw new Error(`${label} contains an unsupported query, hash, or encoded path`)
    }

    return objectKey
}

function getTargetURL(sourceURL, targetBaseURL) {
    return `${targetBaseURL}${sourceURL.slice(SOURCE_MEDIA_URL.length)}`
}

async function getCurrentMedia(client) {
    const videos = await client.query(
        'SELECT id, "thumbnailUrl", "videoUrl" FROM "Video" ORDER BY id',
    )
    const channels = await client.query(
        'SELECT id, image FROM "Channel" WHERE image IS NOT NULL ORDER BY id',
    )
    const userImages = await client.query(
        'SELECT image FROM "User" WHERE image IS NOT NULL ORDER BY id',
    )

    return {
        videos: videos.rows,
        channels: channels.rows,
        userImages: userImages.rows.map((row) => row.image),
    }
}

function validateSourceMedia(media, targetBaseURL) {
    if (media.videos.length !== EXPECTED_COUNTS.videos) {
        throw new Error(`Expected ${EXPECTED_COUNTS.videos} videos, found ${media.videos.length}`)
    }

    if (media.channels.length !== EXPECTED_COUNTS.channelLogos) {
        throw new Error(
            `Expected ${EXPECTED_COUNTS.channelLogos} channel logos, found ${media.channels.length}`,
        )
    }

    const objectKeys = new Set()

    for (const video of media.videos) {
        objectKeys.add(
            assertMediaURL(
                video.thumbnailUrl,
                SOURCE_MEDIA_URL,
                'thumbnail',
                `Video ${video.id} thumbnail`,
            ),
        )
        objectKeys.add(
            assertMediaURL(
                video.videoUrl,
                SOURCE_MEDIA_URL,
                'temp-video',
                `Video ${video.id} video`,
            ),
        )
    }

    for (const channel of media.channels) {
        objectKeys.add(
            assertMediaURL(
                channel.image,
                SOURCE_MEDIA_URL,
                'channel-logo',
                `Channel ${channel.id} image`,
            ),
        )
    }

    if (objectKeys.size !== EXPECTED_COUNTS.thumbnails + EXPECTED_COUNTS.videos + EXPECTED_COUNTS.channelLogos) {
        throw new Error(`Expected 42 unique media keys, found ${objectKeys.size}`)
    }

    if (media.userImages.some((value) => value.startsWith(SOURCE_MEDIA_URL))) {
        throw new Error('A User.image value unexpectedly points to the legacy CloudFront domain')
    }

    return {
        objectKeys: [...objectKeys].sort(),
        videos: media.videos.map((video) => ({
            id: video.id,
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.videoUrl,
            targetThumbnailUrl: getTargetURL(video.thumbnailUrl, targetBaseURL),
            targetVideoUrl: getTargetURL(video.videoUrl, targetBaseURL),
        })),
        channels: media.channels.map((channel) => ({
            id: channel.id,
            image: channel.image,
            targetImage: getTargetURL(channel.image, targetBaseURL),
        })),
    }
}

async function verifyR2Objects(objectKeys) {
    const Bucket = getRequiredEnvironmentVariable('R2_BUCKET_NAME')
    const client = getR2Client()

    await Promise.all(
        objectKeys.map(async (Key) => {
            try {
                await client.send(new HeadObjectCommand({ Bucket, Key }))
            } catch (error) {
                throw new Error(`R2 object verification failed for ${Key}`, { cause: error })
            }
        }),
    )
}

async function applyMigration(client, backup) {
    await client.query('BEGIN')

    try {
        const thumbnails = await client.query(
            `UPDATE "Video"
             SET "thumbnailUrl" = $1 || substring("thumbnailUrl" from $2)
             WHERE "thumbnailUrl" LIKE $3`,
            [
                backup.targetBaseURL,
                SOURCE_MEDIA_URL.length + 1,
                `${SOURCE_MEDIA_URL}/%`,
            ],
        )
        const videos = await client.query(
            `UPDATE "Video"
             SET "videoUrl" = $1 || substring("videoUrl" from $2)
             WHERE "videoUrl" LIKE $3`,
            [
                backup.targetBaseURL,
                SOURCE_MEDIA_URL.length + 1,
                `${SOURCE_MEDIA_URL}/%`,
            ],
        )
        const channelLogos = await client.query(
            `UPDATE "Channel"
             SET image = $1 || substring(image from $2)
             WHERE image LIKE $3`,
            [
                backup.targetBaseURL,
                SOURCE_MEDIA_URL.length + 1,
                `${SOURCE_MEDIA_URL}/%`,
            ],
        )

        const actualCounts = {
            thumbnails: thumbnails.rowCount,
            videos: videos.rowCount,
            channelLogos: channelLogos.rowCount,
        }

        if (JSON.stringify(actualCounts) !== JSON.stringify(EXPECTED_COUNTS)) {
            throw new Error(`Unexpected update counts: ${JSON.stringify(actualCounts)}`)
        }

        const legacyReferences = await client.query(
            `SELECT
                (SELECT count(*) FROM "Video" WHERE "thumbnailUrl" LIKE $1)::int AS thumbnails,
                (SELECT count(*) FROM "Video" WHERE "videoUrl" LIKE $1)::int AS videos,
                (SELECT count(*) FROM "Channel" WHERE image LIKE $1)::int AS "channelLogos"`,
            [`${SOURCE_MEDIA_URL}/%`],
        )

        if (Object.values(legacyReferences.rows[0]).some((count) => count !== 0)) {
            throw new Error(`Legacy references remain: ${JSON.stringify(legacyReferences.rows[0])}`)
        }

        const migratedMedia = await getCurrentMedia(client)
        const migratedVideosById = new Map(migratedMedia.videos.map((video) => [video.id, video]))
        const migratedChannelsById = new Map(
            migratedMedia.channels.map((channel) => [channel.id, channel]),
        )

        for (const video of backup.videos) {
            const migratedVideo = migratedVideosById.get(video.id)

            if (
                migratedVideo?.thumbnailUrl !== video.targetThumbnailUrl
                || migratedVideo.videoUrl !== video.targetVideoUrl
            ) {
                throw new Error(`Video ${video.id} path changed unexpectedly during migration`)
            }
        }

        for (const channel of backup.channels) {
            if (migratedChannelsById.get(channel.id)?.image !== channel.targetImage) {
                throw new Error(`Channel ${channel.id} path changed unexpectedly during migration`)
            }
        }

        await client.query('COMMIT')
        return actualCounts
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    }
}

async function rollbackMigration(client, backup) {
    await client.query('BEGIN')

    try {
        for (const video of backup.videos) {
            const result = await client.query(
                `UPDATE "Video"
                 SET "thumbnailUrl" = $1, "videoUrl" = $2
                 WHERE id = $3 AND "thumbnailUrl" = $4 AND "videoUrl" = $5`,
                [
                    video.thumbnailUrl,
                    video.videoUrl,
                    video.id,
                    video.targetThumbnailUrl,
                    video.targetVideoUrl,
                ],
            )

            if (result.rowCount !== 1) {
                throw new Error(`Video ${video.id} no longer matches the rollback snapshot`)
            }
        }

        for (const channel of backup.channels) {
            const result = await client.query(
                `UPDATE "Channel"
                 SET image = $1
                 WHERE id = $2 AND image = $3`,
                [channel.image, channel.id, channel.targetImage],
            )

            if (result.rowCount !== 1) {
                throw new Error(`Channel ${channel.id} no longer matches the rollback snapshot`)
            }
        }

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    }
}

const [command = '--check', rollbackPath] = process.argv.slice(2).filter((argument) => argument !== '--')
const targetBaseURL = normalizeBaseURL(getRequiredEnvironmentVariable('R2_PUBLIC_URL'))
const client = new pg.Client({
    connectionString: getRequiredEnvironmentVariable('DATABASE_URL'),
})

await client.connect()

try {
    if (command === '--rollback') {
        if (!rollbackPath) {
            throw new Error('Usage: pnpm migrate:media-urls -- --rollback <backup-file>')
        }

        const backup = JSON.parse(await readFile(path.resolve(rollbackPath), 'utf8'))
        await rollbackMigration(client, backup)
        console.log(`Restored ${backup.videos.length} videos and ${backup.channels.length} channels`)
    } else {
        const media = await getCurrentMedia(client)
        const validated = validateSourceMedia(media, targetBaseURL)

        console.log(
            `Validated ${validated.objectKeys.length} database-referenced media objects `
            + `(${validated.videos.length} videos and ${validated.channels.length} channel logos)`,
        )
        console.log(`User profile images left untouched: ${media.userImages.length}`)

        if (command === '--apply') {
            await verifyR2Objects(validated.objectKeys)
            console.log(`Confirmed ${validated.objectKeys.length} referenced objects in R2`)

            const backupDirectory = path.resolve('.migration-backups')
            const timestamp = new Date().toISOString().replaceAll(':', '-')
            const backupPath = path.join(backupDirectory, `media-urls-${timestamp}.json`)
            const backup = {
                createdAt: new Date().toISOString(),
                sourceBaseURL: SOURCE_MEDIA_URL,
                targetBaseURL,
                videos: validated.videos,
                channels: validated.channels,
            }

            await mkdir(backupDirectory, { recursive: true })
            await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, {
                encoding: 'utf8',
                mode: 0o600,
            })

            const counts = await applyMigration(client, backup)
            console.log(`Database migration committed: ${JSON.stringify(counts)}`)
            console.log(`Rollback backup: ${backupPath}`)
        } else if (command !== '--check') {
            throw new Error('Usage: pnpm migrate:media-urls -- [--check|--apply|--rollback <backup-file>]')
        }
    }
} finally {
    await client.end()
}
