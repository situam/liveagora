import type { OpenAPIHono } from "@hono/zod-openapi"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"
import { getObjectStorageUploadUrl } from "./getObjectStorageUploadUrl/handler.ts"

export function registerRoutesV1(app: OpenAPIHono) {
  app.get(`/`, c => c.text("OK"))
  app.post(`/getObjectStorageUploadUrl`, getObjectStorageUploadUrl)
  app.post(`/getHmsRoomToken`, getHmsRoomToken)
}