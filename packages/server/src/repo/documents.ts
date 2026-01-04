import { hocuspocus } from "../hocuspocus/index.ts"
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { DocumentNames } from "@liveagora/common"

export async function transactYdoc(docName: string, transaction: (doc: Y.Doc) => void) {
  const docConnection = await hocuspocus.openDirectConnection(docName)
  await docConnection.transact(transaction)
  await docConnection.disconnect()
}