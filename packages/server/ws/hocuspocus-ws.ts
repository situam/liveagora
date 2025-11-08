import { createNodeWebSocket } from "@hono/node-ws"
import type { Hono } from "hono"
import { env } from "../env.ts"

export function registerWebSockets(app: Hono, hocuspocus: any) {
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

  app.get(
    `${env.routePrefix}/hocuspocus`,
    upgradeWebSocket((ctx) => ({
      onOpen(_evt, ws) {
        hocuspocus.handleConnection(ws.raw, ctx.req.raw)
      },
    }))
  )

  return { injectWebSocket }
}