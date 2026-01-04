import type { RouteHandler } from "@hono/zod-openapi"
import type {
  CreateRoute,
  ListRoute,
  ListSpaceRoute,
  PutRoute,
  PutSpaceRoute,
  RemoveRoute,
  RemoveSpaceRoute
} from "./agoras.routes.ts"
import { deleteAgoraPasswordsRow, getAgoraPasswordRows, getAgoraPasswordsRow, setAgoraPasswordsRow } from "../../../repo/agoraPasswords.ts"
import { DocumentNames, type AgoraPasswordsRow } from "@liveagora/common"
import { generatePassword } from "../../../lib/generatePassword.ts"
import { onCreateAgora } from "../../../hooks/onCreateAgora.ts"
import { deleteSpacePasswordsRow, getSpacePasswordRowsByAgora, setSpacePasswordsRow } from "../../../repo/spacePasswords.ts"

export const list: RouteHandler<ListRoute> = async (c) => {
  const data = await getAgoraPasswordRows()
  return c.json(data, 200)
}

export const create: RouteHandler<CreateRoute> = async (c) => {
  const { agoraId } = c.req.valid("param")
  
  // check if exists
  const rowId = DocumentNames.buildAgoraDoc(agoraId)
  const conflicting = await getAgoraPasswordsRow(rowId)
  if (conflicting) {
    return c.json({error: "Agora already exists"}, 409)
  }

  const row: AgoraPasswordsRow = {
    id: rowId,
    read_password: null,
    edit_password: generatePassword(),
  }
  await setAgoraPasswordsRow(row)

  // run side effects
  onCreateAgora(agoraId)

  return c.body(null, 201)
}

export const put: RouteHandler<PutRoute> = async (c) => {
  const { agoraId } = c.req.valid("param")
  const row = c.req.valid("json")

  const rowId = DocumentNames.buildAgoraDoc(agoraId)
  
  await setAgoraPasswordsRow({
    id: rowId,
    ...row
  })
  return c.body(null, 204)
}

export const remove: RouteHandler<RemoveRoute> = async (c) => {
  const { agoraId } = c.req.valid("param")
  const success = await deleteAgoraPasswordsRow(agoraId)
  if (!success) {
    return c.body(null, 404)
  }
  return c.body(null, 204)
}

export const listSpaces: RouteHandler<ListSpaceRoute> = async (c) => {
  const { agoraId } = c.req.valid("param")
  
  const data = await getSpacePasswordRowsByAgora(agoraId)
  return c.json(data, 200)
}

export const putSpace: RouteHandler<PutSpaceRoute> = async (c) => {
  const { agoraId, spaceId } = c.req.valid("param")
  const row = c.req.valid("json")
  const rowId = DocumentNames.buildSpaceDoc(agoraId, spaceId)
  await setSpacePasswordsRow({
    id: rowId,
    ...row
  })
  return c.body(null, 204)
}

export const removeSpace: RouteHandler<RemoveSpaceRoute> = async (c) => {
  const { agoraId, spaceId } = c.req.valid("param")
  const success = await deleteSpacePasswordsRow(agoraId, spaceId)
  if (!success) {
    return c.body(null, 404)
  }
  return c.body(null, 204)
}
