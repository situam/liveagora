import type { OpenAPIHono, OpenAPIObjectConfigure } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import packageJSON from "../../package.json" with { type: "json" };

const openApiConfig = {
  openapi: "3.0.0",
  info: {
    title: "Live Agora API",
    version: packageJSON.version,
  },
}

export default function configureOpenAPI(app: OpenAPIHono) {
  // register security schemes
  app.openAPIRegistry.registerComponent('securitySchemes', 'BasicAdminAuth', {
    type: 'http',
    scheme: 'basic',
    description: 'Authentication using username and password (username: admin)',
  })
  app.openAPIRegistry.registerComponent('securitySchemes', 'BasicAgoraEditAuth', {
    type: 'http',
    scheme: 'basic',
    description: 'Authentication using username and password (username: agoraId, password: <agora_edit_password>)',
  })

  // run at beginning to catch generation errors
  const openApiDoc = app.getOpenAPIDocument(openApiConfig);

  app.doc("openapi.json", openApiConfig); // TODO: just serve above doc
  app.get('/docs', swaggerUI({
    url: `openapi.json`,
  }))
}