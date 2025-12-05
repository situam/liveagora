import { Hono } from "hono"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { hocuspocus } from "./hocuspocus/index.ts"
import { registerRoutes } from "./routes/index.ts"
import { registerWebSockets } from "./ws/hocuspocus-ws.ts"
import { cors } from "hono/cors"
import { env } from "./env.ts"

export const app = new Hono()

app.use(logger())

// setup CORS middleware
app.use('*',
  cors({
    origin: env.corsOrigin,
    allowMethods: [
      'GET',
      'POST',
      'OPTIONS'
    ],
    allowHeaders: [
      'Content-Type', 
      'Authorization'
    ],
    credentials: true,
  })
)

registerRoutes(app)
const { injectWebSocket } = registerWebSockets(app, hocuspocus)

const server = serve({
  fetch: app.fetch,
  port: env.port,
}, (info) => {
  console.log(`Server started (routePrefix: ${env.routePrefix})`, info)
  hocuspocus.hooks('onListen', {
    instance: hocuspocus,
    configuration: hocuspocus.configuration,
    port: info.port
  })
})

injectWebSocket(server)