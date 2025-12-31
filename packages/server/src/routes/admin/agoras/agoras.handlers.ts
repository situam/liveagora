import type { RouteHandler } from "@hono/zod-openapi"
import type {
  CreateRoute,
  ListRoute,
  PutRoute,
  RemoveRoute
} from "./agoras.routes.ts"
import { deleteAgoraPasswordsRow, getAgoraPasswordRows, getAgoraPasswordsRow, setAgoraPasswordsRow } from "../../../repo/agoraPasswords.ts"
import { DocumentNames, type AgoraPasswordsRow } from "@liveagora/common"
import { generatePassword } from "../../../lib/generatePassword.ts"
import { onCreateAgora } from "../../../hooks/onCreateAgora.ts"

export const list: RouteHandler<ListRoute> = async (c) => {
  const data = await getAgoraPasswordRows()
  return c.json(data, 200)
}

export const create: RouteHandler<CreateRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const type = DocumentNames.parseDocTypeSafe(id)
  if (type !== "agora") {
    return c.json({error: "Invalid ID"}, 400)
  }
  
  // check if exists
  const conflicting = await getAgoraPasswordsRow(id)
  if (conflicting) {
    return c.json({error: "Agora already exists"}, 409)
  }

  const row: AgoraPasswordsRow = {
    id,
    read_password: null,
    edit_password: generatePassword(),
  }
  await setAgoraPasswordsRow(row)

  // run side effects
  onCreateAgora(id)

  return c.body(null, 201)
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