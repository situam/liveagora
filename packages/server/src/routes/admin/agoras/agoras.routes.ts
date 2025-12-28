import { createRoute, z, type RouteConfig } from "@hono/zod-openapi";
import { AgoraPasswordsRowSchema } from "@liveagora/common";
import { requireAdminToken } from "../../../middleware/auth.ts";

const path = "/admin/agoras";
const tags = ["Agoras"];
const commonOpts = {
  tags,
  security: [{ Bearer: [] }],
  middleware: [requireAdminToken] as const,
} satisfies Pick<RouteConfig, "tags" | "security" | "middleware">

const commonResponses = {
  401: {
    description: 'Unauthorized',
  },
  500: {
    description: 'Internal Server Error',
  }
} 

export const list = createRoute({
  path: path,
  method: "get",
  responses: {
    200: {
      description: 'List of agoras',
      content: {
        'application/json': {
          schema: z.array(AgoraPasswordsRowSchema),
        },
      },
    },
    ...commonResponses,
  },
  ...commonOpts
});

export const remove = createRoute({
  path: `${path}/{id}`,
  method: "delete",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'ID of the agora to delete'
      }),
    }),
  },
  responses: {
    200: {
      description: 'Delete success',
      content: {
        'application/json': {
          schema: z.null(),
        },
      },
    },
    404: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: z.null(),
        },
      },
    },
    ...commonResponses,
  },
  ...commonOpts
});

export type ListRoute = typeof list;
// export type CreateRoute = typeof create;
// export type GetOneRoute = typeof getOne;
// export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;