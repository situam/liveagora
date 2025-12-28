import type { OpenAPIHono } from "@hono/zod-openapi"
import { env } from "../env.ts"
import { getImageUploadUrl } from "./getImageUploadUrl/handler.ts"
import { getVideoUploadUrl } from "./getVideoUploadUrl/handler.ts"
import { getHmsRoomToken } from "./getHmsRoomToken/handler.ts"
import { getObjectStorageUploadUrl } from "./getObjectStorageUploadUrl/handler.ts"
import { getAgorasRoute } from "./admin/getAgorasRoute.ts"
import { getAgorasHandler } from "./admin/getAgorasHandler.ts"
import { swaggerUI } from '@hono/swagger-ui'

export function registerRoutes(app: OpenAPIHono) {
  app.get(`${env.routePrefix}/`, c => c.text("OK"))

  app.openapi(getAgorasRoute, getAgorasHandler)

  app.get(`${env.routePrefix}/getImageUploadUrl`, getImageUploadUrl)
  app.get(`${env.routePrefix}/getVideoUploadUrl`, getVideoUploadUrl)
  app.post(`${env.routePrefix}/getObjectStorageUploadUrl`, getObjectStorageUploadUrl)
  app.post(`${env.routePrefix}/getHmsRoomToken`, getHmsRoomToken)

  app.doc(`${env.routePrefix}/openapi.json`, {
    openapi: '3.0.0',
    info: {
      title: 'Agora Admin API',
      version: '1.0.0',
    },
  })

  app.get('/docs', swaggerUI({
    url: `${env.routePrefix}/openapi.json`,
  }))
}