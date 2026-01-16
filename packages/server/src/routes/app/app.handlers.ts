import type { RouteHandler } from "@hono/zod-openapi"
import type { CreateVideoUploadRoute } from "./app.routes.ts"
import { bunnyApiClient } from "../../integration/bunny/bunnyApiClient.ts"
import { generateTusSignature } from "../../integration/bunny/generateTusSignature.ts"
import { env } from "../../env.ts"

export const createVideoUpload: RouteHandler<CreateVideoUploadRoute> = async (c) => {
  const { title } = c.req.valid("json")

  const video = await bunnyApiClient.createVideo(title)

  const { signature, expireAt } = generateTusSignature({
    libraryId: env.bunnyStream.videoLibraryId,
    apiKey: env.bunnyStream.videoLibraryAccessKey,
    videoId: video.guid,
  })

  return c.json({
    tus: {
      endpoint: "https://video.bunnycdn.com/tusupload",
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: expireAt,
        LibraryId: env.bunnyStream.videoLibraryId,
        VideoId: video.guid,
      },
      metadata: {
        title,
      },
    },
    hlsUrl: `https://${env.bunnyStream.videoLibraryPullZone}.b-cdn.net/${video.guid}/playlist.m3u8`
  })
}