import { createNodeWebSocket } from "@hono/node-ws"
import type { Hono } from "hono"

export function registerWebSockets(app: Hono, hocuspocus: any) {
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

  app.get(
    "/hocuspocus",
    upgradeWebSocket((ctx) => ({
      onOpen(_evt, ws) {
        hocuspocus.handleConnection(ws.raw, ctx.req.raw)
      },
    }))
  )

  return { injectWebSocket }
}