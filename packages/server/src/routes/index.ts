import type { OpenAPIHono } from "@hono/zod-openapi"
import { env } from "../env.ts"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"
import { getVideoUploadUrl } from "./getVideoUploadUrl/handler.ts"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"
import { getObjectStorageUploadUrl } from "./getObjectStorageUploadUrl/handler.ts"

export function registerRoutesV1(app: OpenAPIHono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))
  app.get(`${env.routePrefix}/getImageUploadUrl`, getImageUploadUrl)
  app.get(`${env.routePrefix}/getVideoUploadUrl`, getVideoUploadUrl)
  app.post(`${env.routePrefix}/getObjectStorageUploadUrl`, getObjectStorageUploadUrl)
  app.post(`${env.routePrefix}/getHmsRoomToken`, getHmsRoomToken)
}