import type { Hono } from "hono"
import { env } from "../env.ts"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"
import { getVideoUploadUrl } from "./getVideoUploadUrl/handler.ts"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"

export function registerRoutes(app: Hono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))

  app.get(`${env.routePrefix}/getImageUploadUrl`, getImageUploadUrl)
  app.get(`${env.routePrefix}/getVideoUploadUrl`, getVideoUploadUrl)
  app.post(`${env.routePrefix}/getHmsRoomToken`, getHmsRoomToken)
}