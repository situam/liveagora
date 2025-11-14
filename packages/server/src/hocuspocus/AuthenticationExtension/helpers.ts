import type { Connection } from "@hocuspocus/server"
import { canEdit } from "../../auth/auth.ts"

export async function notifyClientOfAuthorizedScope(
  connection: Connection,
  readOnly: boolean
): Promise<void> {
  const scope = readOnly ? 'readonly' : 'read-write'
  console.log("notifyClientOfAuthorizedScope", connection.socketId, scope)

  const payload = JSON.stringify({
    type: 'authorizedScope',
    scope,
  })

  connection.sendStateless(payload)
}

export async function handleRequestEditAccessRPC(
  connection: Connection,
  documentName: string,
  payload: string
): Promise<void> {
  console.log("handleRequestEditAccessRPC", connection.socketId, payload)

  const body = JSON.parse(payload)
  if (body.type !== "requestEditAccess") {
    throw new Error("handleRequestEditAccessRPC: invalid payload")
  }

  const success = await canEdit(body.password, documentName)
  
  connection.readOnly = !success

  const response = JSON.stringify({
    id: body.id,
    success: success
  })
  connection.sendStateless(response)

  notifyClientOfAuthorizedScope(connection, connection.readOnly)
}
