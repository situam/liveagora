import { hmsAPI } from "../integration/hms/hmsApi.ts"
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import { DocumentNames, VALID_SPACE_IDS } from "@liveagora/common"
import { transactYdoc } from "../repo/documents.ts"

export async function onCreateAgora(agoraId: string): Promise<void> {
  const tag = `[onCreateAgora] (agoraId=${agoraId}) `
  try {
    // generate HMS room
    const hmsRoomId = await hmsAPI.createRoom(agoraId)
    console.log(tag, `created room: ${hmsRoomId}`)

    // add to agora ydoc
    const docName = DocumentNames.buildAgoraDoc(agoraId)
    await transactYdoc(docName, (ydoc) => {
      enableDefaultSpace(ydoc)
      addLiveAVRoomIdToAgoraYdoc(ydoc, hmsRoomId)
    })
    console.log(tag, `added room ID to agora ydoc`)
  } catch (e) {
    console.error("[onCreateAgora] error", e)
  }
}

// TODO: DRY fragile strings, type the metadata structure
function enableDefaultSpace(ydoc: Y.Doc) {
  const metadata = new YKeyValue(ydoc.getArray('metadata'))
  metadata.set(`${VALID_SPACE_IDS[0]}-enabled`, true)
}
function addLiveAVRoomIdToAgoraYdoc(ydoc: Y.Doc, roomId: string) {
  const metadata = new YKeyValue(ydoc.getArray('metadata'))
  metadata.set('liveAV/roomID', roomId)
}