import type { Hono } from "hono"
import { env } from "../env.ts"

export function registerRoutes(app: Hono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))
}