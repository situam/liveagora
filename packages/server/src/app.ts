import { serve } from "@hono/node-server"
import { hocuspocus } from "./hocuspocus/index.ts"
import { registerRoutesV1 } from "./routes/index.ts"
import { registerWebSockets } from "./ws/hocuspocus-ws.ts"
import { env } from "./env.ts"
import { createRouter } from './lib/createRouter.ts'
import { onError } from "./middleware/onError.ts"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import configureOpenAPI from "./lib/configureOpenApi.ts"
import { adminRoutes } from "./routes/admin/admin.index.ts"

export const app = createRouter(env.routePrefix)

app.onError(onError)

// Register Bearer token security globally
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  description: 'Authentication using a bearer token',
})

app.use(logger())

// setup CORS middleware
app.use('*',
  cors({
    origin: env.corsOrigin,
    allowMethods: [
      'GET',
      'POST',
      'OPTIONS',
      'DELETE',
    ],
    allowHeaders: [
      'Content-Type', 
      'Authorization'
    ],
    credentials: true,
  })
)

registerRoutesV1(app)

adminRoutes.forEach((route) => {
  app.route("/", route);
});

configureOpenAPI(app)
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