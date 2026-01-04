import { z } from "@hono/zod-openapi"

export const GetUploadUrlBodySchema = z.object({
  filename: z.string().min(1),
})

export const GetUploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  objectUrl: z.url(),
})

export type GetUploadUrlBody = z.infer<typeof GetUploadUrlBodySchema>
export type GetUploadUrlResponse = z.infer<typeof GetUploadUrlResponseSchema>

export const GetAgoraPasswordsRowBodySchema = z.object({
  id: z.string(),
})
export type GetAgoraPasswordsRowBody = z.infer<typeof GetAgoraPasswordsRowBodySchema>