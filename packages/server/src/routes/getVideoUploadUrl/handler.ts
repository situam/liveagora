import type { Context } from "hono"
import { getCloudflareStreamDirectUploadUrl } from "./getCloudflareStreamDirectUploadUrl.ts"

// TODO: type response
export async function getVideoUploadUrl(c: Context){
  try {
    const data = await getCloudflareStreamDirectUploadUrl()

    return c.json(data, 200)
  } catch (err) {
    return c.json(
      { error: String(err) },
      500
    )
  }
}