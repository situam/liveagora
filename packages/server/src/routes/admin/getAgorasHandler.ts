import type { RouteHandler } from "@hono/zod-openapi"
import { getAgorasRoute } from "./getAgorasRoute.ts"
import { getAgoraPasswordRows } from "../../repo/agoraPasswords.ts"

export const getAgorasHandler: RouteHandler<typeof getAgorasRoute> = async (c) => {
  try {
    const data = await getAgoraPasswordRows()
    return c.json(data, 200)
  } catch (err) {
    return c.body(null, 500)
  }
}