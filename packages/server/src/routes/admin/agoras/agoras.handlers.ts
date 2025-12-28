import type { RouteHandler } from "@hono/zod-openapi"
import type {
  ListRoute,
  RemoveRoute
} from "./agoras.routes.ts"
import { deleteAgoraPasswordsRow, getAgoraPasswordRows } from "../../../repo/agoraPasswords.ts"

export const list: RouteHandler<ListRoute> = async (c) => {
  const data = await getAgoraPasswordRows()
  return c.json(data, 200)
}

export const remove: RouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const success = await deleteAgoraPasswordsRow(id)
  // TBD: also delete spaces associated with this agora
  if (!success) {
    return c.json(null, 404)
  }
  return c.json(null, 200)
}