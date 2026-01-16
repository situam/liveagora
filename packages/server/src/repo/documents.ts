import { hocuspocus } from "../hocuspocus/index.ts"
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { DocumentNames } from "@liveagora/common"
import { getDb } from "../auth/db.ts"

export async function transactYdoc(docName: string, transaction: (doc: Y.Doc) => void) {
  const docConnection = await hocuspocus.openDirectConnection(docName)
  await docConnection.transact(transaction)
  await docConnection.disconnect()
}

export async function deleteDocument(name: string): Promise<boolean> {
  const db = getDb();
  const res = await db.run(
    `DELETE FROM documents WHERE name = ?`,
    [name]
  )
  return res.changes > 0
}