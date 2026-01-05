import type { GetUploadUrlBody, GetUploadUrlResponse } from "@liveagora/common"
import { Env } from "../config/env"

export async function getUploadUrl(body: GetUploadUrlBody): Promise<GetUploadUrlResponse | null> {
  const res = await fetch(`${Env.serverUrlV1}/getObjectStorageUploadUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (res.status !== 200) {
    return null
  }

  return res.json() as Promise<GetUploadUrlResponse>
}