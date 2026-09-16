import { createServerFn } from '@tanstack/start-client-core'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { requireAuth } from './auth'
import { randomBytes } from 'node:crypto'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

function getS3() {
  return new S3Client({
    endpoint: process.env['S3_ENDPOINT']!,
    region: process.env['S3_REGION']!,
    credentials: {
      accessKeyId: process.env['S3_ACCESS_KEY_ID']!,
      secretAccessKey: process.env['S3_SECRET_ACCESS_KEY']!,
    },
    forcePathStyle: true,
  })
}

export const uploadImageFn = createServerFn({ method: 'POST' })
  .validator((data: { filename: string; mimeType: string; base64: string }) => data)
  .handler(async ({ data }) => {
    await requireAuth()

    if (!ALLOWED_MIME.has(data.mimeType)) {
      throw new Error('Unsupported image type')
    }

    const buffer = Buffer.from(data.base64, 'base64')
    if (buffer.byteLength > MAX_BYTES) {
      throw new Error('Image too large (max 5MB)')
    }

    const ext = data.filename.split('.').pop() ?? 'jpg'
    const key = `uploads/${randomBytes(16).toString('hex')}.${ext}`

    const s3 = getS3()
    await s3.send(new PutObjectCommand({
      Bucket: process.env['S3_BUCKET']!,
      Key: key,
      Body: buffer,
      ContentType: data.mimeType,
      CacheControl: 'public, max-age=31536000',
    }))

    return { url: `${process.env['PUBLIC_STORAGE_URL']!}/${key}` }
  })
