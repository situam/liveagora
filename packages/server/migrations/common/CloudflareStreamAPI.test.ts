import { describe, it, expect } from "vitest"
import { CloudflareStreamAPI } from "./CloudflareStreamAPI.ts";
import 'dotenv/config'

const api = new CloudflareStreamAPI(
  process.env.CLOUDFLARE_STREAM_ACCOUNT_ID!,
  process.env.API_TOKEN_CLOUDFLARE_STREAM_IMAGES!
)

describe('CloudflareStreamAPI', () => {
  it('should get the video name', async () => {
    const videoId = 'b85b597a0f7bbe385aee0ef327634c2e'
    const name = await api.getVideoName(videoId)
    expect(name).toBe('snippets.mov')
  })
})