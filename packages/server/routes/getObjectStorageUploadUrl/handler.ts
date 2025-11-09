import type { Context } from "hono"
import { getS3SignedUrl } from "./getS3DirectUploadUrl.ts"
import { GetUploadUrlBodySchema, type GetUploadUrlResponse } from "@liveagora/common"

export async function getObjectStorageUploadUrl(c: Context) {
  try {
    const parsed = GetUploadUrlBodySchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.text("Invalid request", 400)
    }

    const res: GetUploadUrlResponse = await getS3SignedUrl(parsed.data.filename)

    return c.json(res, 200)
  } catch (err) {
    return c.text(String(err), 500)
  }
}