import { useEffect } from 'react'

import {
  useHMSStore,
  selectIsLocalScreenShared,
  selectLocalPeerID,
} from '@100mslive/react-sdk'

import { useAgora } from '../context/AgoraContext';

export function LiveAVScreensharePresenceSyncroniser() {
  const isLocalScreenShared = useHMSStore(selectIsLocalScreenShared)
  const localPeerId = useHMSStore(selectLocalPeerID)

  const agora = useAgora()

  useEffect(()=>{
    const localState = agora.presence.getLocalState()
    if (!localState) return
    
    if (isLocalScreenShared) {
      if (!localState.screenshare || localState.screenshare?.data?.liveAVId != localPeerId) {
        agora.presence.startScreenshare(localPeerId)
      }
    } else {
      if (localState.screenshare) {
        agora.presence.stopScreenshare()
      }
    }
  }, [isLocalScreenShared, localPeerId])

  return null
}