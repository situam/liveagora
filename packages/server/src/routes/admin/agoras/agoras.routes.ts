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
  400: {
    description: 'Bad Request',
  },
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

export const create = createRoute({
  path: `${path}/{id}`,
  method: "post",
  request: {
    params: z.object({
      id: z.string()
    }),
  },
  responses: {
    201: {
      description: 'Created',
    },
    409: {
      description: 'Conflict',
    },
    ...commonResponses,
  },
  ...commonOpts
});

export const put = createRoute({
  path: path,
  method: "put",
  request: {
    body: {
      content: {
        'application/json': {
          schema: AgoraPasswordsRowSchema
        },
      },
    }
  },
  responses: {
    204: {
      description: 'Success',
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
      id: z.string()
    }),
  },
  responses: {
    204: {
      description: 'Success',
    },
    404: {
      description: 'Not Found',
    },
    ...commonResponses,
  },
  ...commonOpts
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
// export type GetOneRoute = typeof getOne;
export type PutRoute = typeof put;
export type RemoveRoute = typeof remove;