import { hocuspocus } from "../hocuspocus/index.ts"
import { hmsAPI } from "../integration/hms/hmsApi.ts"
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'

export async function onCreateAgora(id: string): Promise<void> {
  const tag = `[onCreateAgora] (id=${id}) `
  try {
    // generate HMS room
    const hmsRoomId = await hmsAPI.createRoom(id)
    console.log(tag, `created room: ${hmsRoomId}`)

    // add to agora ydoc
    const docConnection = await hocuspocus.openDirectConnection(id)
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