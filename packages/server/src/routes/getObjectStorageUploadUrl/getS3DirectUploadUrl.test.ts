import { describe, it, expect } from "vitest"
import { getS3SignedUrl } from "./getS3DirectUploadUrl.ts"

describe("getS3SignedUrl", () => {
  it("gets a url successfully", async () => {
    const filename = "test.mp3"
    const res = await getS3SignedUrl(filename, "audio/mpeg")
    console.log(res)
  })
})