import { createRoute, z } from "@hono/zod-openapi";
import { AgoraPasswordsRowSchema } from "@liveagora/common";
import { env } from "../../env.ts";
import { requireAdminToken } from "../../middleware/auth.ts";

export const getAgorasRoute = createRoute({
  method: 'get',
  path: `${env.routePrefix}/admin/agoras`,
  summary: 'List all agoras',
  tags: ['admin'],
  security: [{ Bearer: [] }],
  middleware: [requireAdminToken] as const,
  responses: {
    200: {
      description: 'List of agoras',
      content: {
        'application/json': {
          schema: z.array(AgoraPasswordsRowSchema),
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
    500: {
      description: 'Internal Server Error',
    }
  },
})