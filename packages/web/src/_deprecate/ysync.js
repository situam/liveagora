import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { HocuspocusProvider } from '@hocuspocus/provider'
//import { IndexeddbPersistence } from 'y-indexeddb'

const VERSION = '0.0.007'
const DOCNAME = `connectiontest.sandbox.${VERSION}`

const YDOC = new Y.Doc()
const yServerProvider = new HocuspocusProvider({
  url: 'ws://localhost:3000',
  name: DOCNAME,
  document: YDOC,
  onOpen: () => {
    console.log('hocuspocus opened -', DOCNAME)
  },
  broadcast: false,
})

/*
const yLocalProvider = new IndexeddbPersistence(DOCNAME, YDOC)

yLocalProvider.on('synced', () => {
  console.log('content from the local database is loaded')
})
*/

export const ykvNodes = new YKeyValue(YDOC.getArray(`nodes`))
export const ykvMetadata = new YKeyValue(YDOC.getArray(`metadata`)) // not used yet
export const yawarenessNodes = yServerProvider.awareness

window.logydata = (yData = ykvNodes.yarray) => {
  let json = yData.toJSON()
  console.log("logydata", JSON.stringify(json).length, json)
}

