import type { RouteHandler } from "@hono/zod-openapi"
import type {
  ListRoute,
  PutRoute,
  RemoveRoute
} from "./agoras.routes.ts"
import { deleteAgoraPasswordsRow, getAgoraPasswordRows, setAgoraPasswordsRow } from "../../../repo/agoraPasswords.ts"
import { DocumentNames, type AgoraPasswordsRow } from "@liveagora/common"

export const list: RouteHandler<ListRoute> = async (c) => {
  const data = await getAgoraPasswordRows()
  return c.json(data, 200)
}

export const put: RouteHandler<PutRoute> = async (c) => {
  const row: AgoraPasswordsRow = c.req.valid("json")
  const type = DocumentNames.parseDocTypeSafe(row.id)
  if (type !== "agora") {
    return c.json({error: "Invalid ID"}, 400)
  }
  await setAgoraPasswordsRow(row)
  return c.body(null, 204)
}

export const remove: RouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const success = await deleteAgoraPasswordsRow(id)
  // TBD: also delete spaces associated with this agora
  if (!success) {
    return c.body(null, 404)
  }
  return c.body(null, 204)
}