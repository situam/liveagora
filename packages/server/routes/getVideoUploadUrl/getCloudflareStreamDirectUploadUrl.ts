import { env } from "../../env.ts"

export async function getCloudflareStreamDirectUploadUrl() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.cloudflareStreamAccountId}/stream/direct_upload`

  const body = {
    // allowedOrigins: [ env.corsOrigin ],
    creator: "creator-id_agora_function",
    maxDurationSeconds: 600,
    // meta: { name: "video12345.mp4" },
    requireSignedURLs: false,
    thumbnailTimestampPct: 0.529241,
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Upload-Creator": "",
      "Authorization": `Bearer ${env.apiTokenCloudflareStreamImages}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => "")
    throw new Error(`error: ${res.status} ${res.statusText} — ${errBody}`)
  }

  return res.json()
}