import { getAgoraPasswordsRow } from "../repo/agoraPasswords.ts"
import { getSpacePasswordsRow } from "../repo/spacePasswords.ts";
import type { AgoraPasswordsRow } from "@liveagora/common";
import { DocumentNames } from "@liveagora/common";
import { parseDocType } from "@liveagora/common/dist/documentNames.js";

async function canRead(password: string, documentName: string): Promise<boolean> {
  const type = parseDocType(documentName)

  // read access is determined by the agora's read password
  let row: AgoraPasswordsRow

  switch (type) {
    case "agora":
      row = await getAgoraPasswordsRow(documentName)
      break

    case "space": 
      row = await getAgoraPasswordsRow(
        DocumentNames.getAgoraDocFromSpaceDoc(documentName)
      )
      break
      
    default:
      throw new Error(`checkPassword: unhandled document type ${type}`)
  }

  // no password row means no read access
  if (row == null) return false

  // null password means public read access
  if (row.read_password == null) return true

  return row.read_password === password
}

async function canEdit(password: string, documentName: string): Promise<boolean> {
  const type = parseDocType(documentName)

  switch (type) {
    case "agora":
    {
      const row = await getAgoraPasswordsRow(documentName)

      // if no password row, no edit access
      if (row == null) return false

      return row.edit_password === password
    }

    case "space":
    {
      // also allow edit access given the agora's edit password
      const agoraRow = await getAgoraPasswordsRow(
        DocumentNames.getAgoraDocFromSpaceDoc(documentName)
      )
      if (agoraRow.edit_password === password) {
        console.log("[canEdit] granted by agora edit password")
        return true
      }

      const row = await getSpacePasswordsRow(documentName)

      // if no password row, no edit access
      if (row == null) return false

      // null edit password means public edit access
      if (row.edit_password == null) return true

      return row.edit_password === password
    }
    
    default:
      throw new Error("checkPassword: unhandled document type")
  }
}

export {
  canRead,
  canEdit,
}