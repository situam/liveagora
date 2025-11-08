import type { Hono } from "hono"
import { env } from "../env.ts"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"

export function registerRoutes(app: Hono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))

  app.get(`${env.routePrefix}/getImageUploadUrl`, getImageUploadUrl)
}