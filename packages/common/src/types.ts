import { z } from "zod"

export const GetObjectStorageUploadUrlBodySchema = z.object({
  filename: z.string().min(1),
})

export const GetUploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  objectUrl: z.url(),
})

export type GetObjectStorageUploadUrlBody = z.infer<typeof GetObjectStorageUploadUrlBodySchema>
export type GetUploadUrlResponse = z.infer<typeof GetUploadUrlResponseSchema>
