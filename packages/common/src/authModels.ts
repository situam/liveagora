import { z } from "@hono/zod-openapi"

export const AgoraPasswordsRowSchema = z.object({
  id: z.string(),
  read_password: z.string().nullable(),
  edit_password: z.string(),
})

export type AgoraPasswordsRow = z.infer<typeof AgoraPasswordsRowSchema>

export const SpacePasswordsRowSchema = z.object({
  id: z.string(),
  edit_password: z.string().nullable(),
})

export type SpacePasswordsRow = z.infer<typeof SpacePasswordsRowSchema>