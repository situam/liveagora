import { hocuspocus } from "../hocuspocus/index.ts"
import { hmsAPI } from "../integration/hms/hmsApi.ts"
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { DocumentNames } from "@liveagora/common"

export async function onCreateAgora(agoraId: string): Promise<void> {
  const tag = `[onCreateAgora] (agoraId=${agoraId}) `
  try {
    // generate HMS room
    const hmsRoomId = await hmsAPI.createRoom(agoraId)
    console.log(tag, `created room: ${hmsRoomId}`)

    // add to agora ydoc
    const docName = DocumentNames.buildAgoraDoc(agoraId)
    const docConnection = await hocuspocus.openDirectConnection(docName)
    await docConnection.transact((ydoc) => {
      addLiveAVRoomIdToAgoraYdoc(ydoc, hmsRoomId)
    })
    await docConnection.disconnect()
    console.log(tag, `added room ID to agora ydoc`)
  } catch (e) {
    console.error("[onCreateAgora] error", e)
  }
}

// TODO: DRY fragile strings, type the metadata structure
function addLiveAVRoomIdToAgoraYdoc(ydoc: Y.Doc, roomId: string) {
  const metadata = new YKeyValue(ydoc.getArray('metadata'))
  metadata.set('liveAV/roomID', roomId)
}