import { describe, it, expect } from "vitest"
import { hmsAPI } from "./hmsApi.ts"

describe("HmsAPI", () => {
  describe("createRoom", () => {
    it("creates a room successfully", async () => {
      const agoraName = "test-agora"
      const roomId = await hmsAPI.createRoom(agoraName)
      expect(typeof roomId).toBe("string")
    })
  })
})