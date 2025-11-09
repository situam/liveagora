import { env } from "../../env.ts"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { GetUploadUrlResponse } from "@liveagora/common"

export async function getS3SignedUrl(filename: String): Promise<GetUploadUrlResponse> {
  const client = new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
    forcePathStyle: true, // so that bucket name is in path, not subdomain
  })

  const key = `uploads/${crypto.randomUUID()}-${filename}`

  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: "audio/mpeg", // TODO: make this dynamic
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 })
  const objectUrl = `${env.s3.endpoint.replace(/\/$/, "")}/${env.s3.bucket}/${key}`

  return {
    uploadUrl,
    objectUrl,
  }
}