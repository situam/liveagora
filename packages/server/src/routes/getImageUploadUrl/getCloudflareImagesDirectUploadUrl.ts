import { env } from "../../env.ts"

export async function getCloudflareImagesDirectUploadUrl() {
  const form = new FormData()
  form.append("requireSignedURLs", "false")
  //form.append("metadata", JSON.stringify({ key: "value" }))

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.cloudflareImagesAccountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.apiTokenCloudflareStreamImages}`,
      },
      body: form,
    }
  )

  if (!response.ok) {
    throw new Error(`[fetchImageUploadUrl] error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}