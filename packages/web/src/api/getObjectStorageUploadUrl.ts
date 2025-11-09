import type { GetUploadUrlBody, GetUploadUrlResponse } from "@liveagora/common"

export async function getUploadUrl(body: GetUploadUrlBody): Promise<GetUploadUrlResponse | null> {
  const res = await fetch(`${import.meta.env.VITE_LIVEAGORA_SERVER_URL}/getObjectStorageUploadUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (res.status !== 200) {
    return null
  }

  return res.json() as Promise<GetUploadUrlResponse>
}