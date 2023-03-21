import { useEffect } from 'react'

import {
  useHMSStore,
  selectIsConnectedToRoom,
  selectIsLocalScreenShared,
  selectLocalPeerID,
  HMSLogLevel,
  useHMSActions
} from '@100mslive/react-sdk'

import { useLiveAVSubspace } from '../components/LiveAV';
import { useAwareness } from '../hooks/useAwareness';
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions";
import { LiveAVErrorHandler } from '../components/LiveAVErrorHandler';

function ScreenShareObserver() {
  const amIScreenSharing = useHMSStore(selectIsLocalScreenShared)
  const localPeerId = useHMSStore(selectLocalPeerID)
  const { addNode, getNode, deleteNode } = usePersistedNodeActions()

  const awareness = useAwareness()

  useEffect(()=>{
    console.log("[ScreenShareObserver] hello")
    const nodeId = `screenshare.${awareness?.clientID}`

    if (amIScreenSharing) {
      console.log("[ScreenShareObserver] started screen sharing", getNode(nodeId))
      if (!getNode(nodeId)) {
        
        let newNode = {
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
          z: 50,
          width: 600,
          height: 420,
        }
        console.log('newnode', newNode)
        addNode(newNode)
      }
    }

    if (!amIScreenSharing) {
      console.log("[ScreenShareObserver] stop screen sharing")
      deleteNode(nodeId)
    }
  }, [amIScreenSharing, localPeerId])

  return null
}

export function LiveAVObserver() {
  const inCall = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions()
  const awareness = useAwareness()
  const { syncLiveAVWithAwareness } = useLiveAVSubspace()

  useEffect(()=>{
    hmsActions.setLogLevel(HMSLogLevel.WARN);
    console.log("[LiveAVObserver] hello")
    
    awareness.setLocalStateField('data', {
      ...awareness.getLocalState()?.data,
      inCall
    })

    if (inCall) {
      //Joined call
      // change the liveav role and video/audio state according to space and subspace awareness
      syncLiveAVWithAwareness()
    }
      
  }, [inCall])

  return (
    <>
      <ScreenShareObserver/>
      <LiveAVErrorHandler/>
    </>
  )
}
