import { env } from "../../env.ts"
import type { GetUploadUrlResponse } from "@liveagora/common"
import AWS from 'aws-sdk'

const scw = new AWS.S3({    
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  accessKeyId: env.s3.accessKeyId,
  secretAccessKey: env.s3.secretAccessKey,
  signatureVersion: "v4",
  params: { Bucket: env.s3.bucket },
  s3ForcePathStyle: true,
})

export async function getS3SignedUrl(
  filename: String,
  contentType: String,
): Promise<GetUploadUrlResponse> {
  const key = `uploads/${crypto.randomUUID()}-${filename}`
  const uploadUrl = scw.getSignedUrl(
    'putObject',
    {
      Key: key,
      ContentType: contentType
    }
  )
  const objectUrl = `${env.s3.endpoint}/${env.s3.bucket}/${key}`
  return {
    uploadUrl,
    objectUrl,
  }
}