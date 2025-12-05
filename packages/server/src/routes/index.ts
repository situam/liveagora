import type { Hono } from "hono"
import { env } from "../env.ts"
import { requireAdminToken } from "../middleware/auth.ts"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"
import { getVideoUploadUrl } from "./getVideoUploadUrl/handler.ts"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"
import { getObjectStorageUploadUrl } from "./getObjectStorageUploadUrl/handler.ts"
import { getAgoras } from "./getAgoras/handler.ts"

export function registerRoutes(app: Hono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))

  app.get(`${env.routePrefix}/getAgoras`, requireAdminToken, getAgoras)

  app.get(`${env.routePrefix}/getImageUploadUrl`, getImageUploadUrl)
  app.get(`${env.routePrefix}/getVideoUploadUrl`, getVideoUploadUrl)
  app.post(`${env.routePrefix}/getObjectStorageUploadUrl`, getObjectStorageUploadUrl)
  app.post(`${env.routePrefix}/getHmsRoomToken`, getHmsRoomToken)
}