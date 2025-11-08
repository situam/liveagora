import { Hono } from "hono"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { env } from "../env.ts"

import { registerRoutes } from "../routes/index.ts"
import { registerWebSockets } from "../ws/hocuspocus-ws.ts"

import { hocuspocus } from "../hocuspocus/index.ts"

const app = new Hono()
app.use(logger())

// register http routes
registerRoutes(app)

// register websocket routes
const { injectWebSocket } = registerWebSockets(app, hocuspocus)

const server = serve({ fetch: app.fetch, port: env.port }, info => {
  console.log("Server started", info)
  hocuspocus.hooks("onListen", {
    instance: hocuspocus,
    configuration: hocuspocus.configuration,
    port: info.port
  })
})

injectWebSocket(server)