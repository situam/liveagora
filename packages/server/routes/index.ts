import type { Hono } from "hono"

export function registerRoutes(app: Hono) {
  app.get("/", c => c.text("OK"))
}