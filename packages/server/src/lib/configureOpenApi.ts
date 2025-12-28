import type { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: OpenAPIHono) {
  app.doc(`openapi.json`, {
    openapi: '3.0.0',
    info: {
      title: 'Agora Admin API',
      version: packageJSON.version,
    },
  })

  app.get('/docs', swaggerUI({
    url: `openapi.json`,
  }))
}