import { describe, it, expect } from "vitest"
import { bunnyApiClient } from "./bunnyApiClient.ts"

describe("BunnyApiClient", () => {
  describe("createVideo", () => {
    it("creates a video successfully", async () => {
      const videoTitle = "test-video"
      const { guid } = await bunnyApiClient.createVideo(videoTitle)
      console.log("Created video GUID:", guid)
    })
  })
})