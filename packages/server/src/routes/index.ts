import type { OpenAPIHono } from "@hono/zod-openapi"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"
import { getVideoUploadUrl } from "./getVideoUploadUrl/handler.ts"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"
import { getObjectStorageUploadUrl } from "./getObjectStorageUploadUrl/handler.ts"

export function registerRoutesV1(app: OpenAPIHono) {
  app.get(`/`, c => c.text("OK"))
  app.get(`/getImageUploadUrl`, getImageUploadUrl)
  app.get(`/getVideoUploadUrl`, getVideoUploadUrl)
  app.post(`/getObjectStorageUploadUrl`, getObjectStorageUploadUrl)
  app.post(`/getHmsRoomToken`, getHmsRoomToken)
}