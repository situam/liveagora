import type { Connection } from "@hocuspocus/server"
import { AccessRoles, type AccessRole } from "./AccessRole.ts"

async function checkToken(token, room): Promise<AccessRole | null> {
  const VIEWER_ACCESS_TOKEN = "read"
  const EDITOR_ACCESS_TOKEN = "edit"
  const OWNER_ACCESS_TOKEN = "owner"

  await new Promise(resolve => setTimeout(resolve, 500))

  switch (token) {
    case VIEWER_ACCESS_TOKEN:
      return AccessRoles.Viewer
    case EDITOR_ACCESS_TOKEN:
      return AccessRoles.Editor
    case OWNER_ACCESS_TOKEN:
      return AccessRoles.Owner
    default:
      return null
  }
}

async function notifyClientOfAccessRole(
  connection: Connection,
  accessRole: AccessRole
): Promise<void> {
  console.log("notifyClientOfAccessRole", connection.socketId, accessRole)

  const payload = JSON.stringify({
    type: 'accessRole',
    accessRole: accessRole.id
  })

  connection.sendStateless(payload)
}

async function handleRequestEditAccessRPC(
  connection: Connection,
  documentName: string,
  payload: string
): Promise<void> {
  console.log("handleRequestEditAccessRPC", connection.socketId, payload)

  const body = JSON.parse(payload)
  if (body.type !== "requestEditAccess") {
    throw new Error("handleRequestEditAccessRPC: invalid payload")
  }

  const accessRole = await checkToken(body.password, documentName)

  if (accessRole?.canEdit) {
    connection.readOnly = false;
    connection.context.accessRole = accessRole
  } else {
    connection.readOnly = true
  }

  const response = JSON.stringify({
    id: body.id,
    success: connection.context.accessRole.canEdit === true
  })
  connection.sendStateless(response)

  notifyClientOfAccessRole(connection, connection.context.accessRole)
}

export { checkToken, notifyClientOfAccessRole, handleRequestEditAccessRPC }