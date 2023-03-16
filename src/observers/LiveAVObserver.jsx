import { useEffect } from 'react'

import {
  useHMSStore,
  selectIsConnectedToRoom,
  selectIsLocalScreenShared,
  selectLocalPeerID,
} from '@100mslive/react-sdk'

import { useAwareness } from '../hooks/useAwareness';
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions";

function ScreenShareObserver() {
  const amIScreenSharing = useHMSStore(selectIsLocalScreenShared)
  const localPeerId = useHMSStore(selectLocalPeerID)
  const { addNode, getNode, deleteNode } = usePersistedNodeActions()

  const awareness = useAwareness()

  useEffect(()=>{
    const nodeId = `screenshare.${awareness?.clientID}`

    if (amIScreenSharing) {
      if (!getNode(nodeId)) {
        addNode({
          id: nodeId,
          type: 'ScreenShareNode',
          data: {
            liveAVId: localPeerId,
            label: `${awareness.getLocalState()?.data?.name}'s screen`
          },
          position: {
            x: 0,
            y: 0
          },
          width: 600,
          height: 420,
        })
      }
    }

    if (!amIScreenSharing) {
      deleteNode(nodeId)
    }
  }, [amIScreenSharing, localPeerId])

  return null
}


export function LiveAVObserver() {
  const inCall = useHMSStore(selectIsConnectedToRoom);
  //const callRole = useHMSStore(selectLocalPeerRoleName)
  const awareness = useAwareness()

  useEffect(()=>{
    awareness.setLocalStateField('data', {
      ...awareness.getLocalState()?.data,
      inCall
    })
  }, [inCall])

  return (
    <ScreenShareObserver/>
  )
}
