import {
  useVideo,
  useHMSStore,
  selectScreenShareByPeerID,
  selectPeers,
} from "@100mslive/react-sdk";

import { useMemo } from 'react'

export function LiveAVScreenShare({ data }) {
  const peers = useHMSStore(selectPeers)
  const peer = useMemo(()=>peers.find((p)=>p.id == data?.liveAVId), [peers])

  const screenshareVideoTrack = useHMSStore(selectScreenShareByPeerID( peer.id ))
  const { videoRef } = useVideo({ trackId: screenshareVideoTrack?.id })

  if (!screenshareVideoTrack)
    return <div>screenshare ghost</div>

  return (
    <video
      ref={videoRef}
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      autoPlay
      muted
      playsInline
    />
  )
}