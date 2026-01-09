import { createRoute, z, type RouteConfig } from "@hono/zod-openapi";
//import { requireAdminAuth, requireAgoraEditAuth } from "../../../middleware/auth.ts";

const commonOpts = {
  tags: ["App"],
  //security: [{ BasicAdminAuth: [] }],
  //middleware: [requireAdminAuth] as const,
} satisfies Pick<RouteConfig, "tags" | "security" | "middleware">


const commonResponses = {
  400: {
    description: 'Bad Request',
  },
//   401: {
//     description: 'Unauthorized',
//   },
  500: {
    description: 'Internal Server Error',
  }
} 

export const createVideoUpload = createRoute({
  path: "/videoUpload",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(1),
          })
        },
      },
    },
  },
  responses: {
    200: {
      description: "Create Video Upload response",
      content: {
        "application/json": {
          schema: z.object({
            tus: z.object({
              endpoint: z.string().openapi({ example: "https://video.bunnycdn.com/tusupload" }),
              headers: z.object({
                AuthorizationSignature: z.string(),
                AuthorizationExpire: z.string(),
                LibraryId: z.string(),
                VideoId: z.string(),
              }),
              metadata: z.object({
                title: z.string(),
              }),
            }),
            hlsUrl: z.httpUrl()
          })
        },
      },
    },
    ...commonResponses,
  },
  ...commonOpts
});

export type CreateVideoUploadRoute = typeof createVideoUpload