import createClient, { type Middleware } from "openapi-fetch"
import type { paths } from "./generated-stream-schema.d.ts"
import { env } from "../../env.ts"

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set("AccessKey", env.bunnyStream.videoLibraryAccessKey);
    return request
  },
}

const client = createClient<paths>({ baseUrl: "https://video.bunnycdn.com/" });
client.use(authMiddleware)

class BunnyApi {
  async createVideo(title: string) {
    const { data, error } = await client.POST("/library/{libraryId}/videos", {
      params: {
        path: {
          libraryId: env.bunnyStream.videoLibraryId,
        }
      },
      body: {
        title: title,
      }
    })
    if (error) {
      throw new Error(`Bunny createVideo failed: ${JSON.stringify(error)}`);
    }
    return data
  }
}

export const bunnyApiClient = new BunnyApi();