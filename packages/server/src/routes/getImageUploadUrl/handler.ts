import type { Context } from "hono"
import { getCloudflareImagesDirectUploadUrl } from "./getCloudflareImagesDirectUploadUrl.ts"

// TODO: type response
export async function getImageUploadUrl(c: Context){
  try {
    const data = await getCloudflareImagesDirectUploadUrl()

    return c.json(data, 200)
  } catch (err) {
    return c.json(
      { error: String(err) },
      500
    )
  }
}