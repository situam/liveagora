import { createRoute, z, type RouteConfig } from "@hono/zod-openapi";
import { AgoraIdParamSchema, AgoraIdSchema, AgoraPasswordsRowSchema, SpaceIdSchema, SpacePasswordsRowSchema } from "@liveagora/common";
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
  path: `${path}/{agoraId}`,
  method: "post",
  request: {
    params: AgoraIdParamSchema,
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
  path: `${path}/{agoraId}`,
  method: "put",
  request: {
    params: AgoraIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: AgoraPasswordsRowSchema.omit({id: true})
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
  path: `${path}/{agoraId}`,
  method: "delete",
  request: {
    params: AgoraIdParamSchema,
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


export const listSpaces = createRoute({
  path: `${path}/{agoraId}/spaces`,
  method: "get",
  request: {
    params: AgoraIdParamSchema,
  },
  responses: {
    200: {
      description: 'List of space passwords',
      content: {
        'application/json': {
          schema: z.array(SpacePasswordsRowSchema),
        },
      },
    },
    ...commonResponses,
  },
  ...commonOpts // TODO: different auth middleware (check agora backstage password)
});

export const putSpace = createRoute({
  path: `${path}/{agoraId}/spaces/{spaceId}`,
  method: "put",
  request: {
    params: z.object({
      agoraId: AgoraIdSchema,
      spaceId: SpaceIdSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: SpacePasswordsRowSchema.omit({id: true})
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
  ...commonOpts // TODO: different auth middleware (check agora backstage password)
});

export const removeSpace = createRoute({
  path: `${path}/{agoraId}/spaces/{spaceId}`,
  method: "delete",
  request: {
    params: z.object({
      agoraId: AgoraIdSchema,
      spaceId: SpaceIdSchema,
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
  ...commonOpts // TODO: different auth middleware (check agora backstage password)
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
// export type GetOneRoute = typeof getOne;
export type PutRoute = typeof put;
export type RemoveRoute = typeof remove;

export type ListSpaceRoute = typeof listSpaces;
export type PutSpaceRoute = typeof putSpace;
export type RemoveSpaceRoute = typeof removeSpace;