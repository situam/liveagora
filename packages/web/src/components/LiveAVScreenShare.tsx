import {
  useVideo,
  useHMSStore,
  selectScreenShareByPeerID,
  selectPeers,
  useScreenShare,
} from "@100mslive/react-sdk";

import { useMemo } from 'react'
import { AwarenessScreenshareState } from "../model/AwarenessState";

export function LiveAVScreenShare({ data }: {data: AwarenessScreenshareState["data"]}) {
  const peers = useHMSStore(selectPeers)
  const peer = useMemo(()=>peers.find((p)=>p.id == data?.liveAVId), [peers])

  const screenshareVideoTrack = useHMSStore(selectScreenShareByPeerID( peer?.id ))
  const { videoRef } = useVideo({
    trackId: screenshareVideoTrack?.id,
    //threshold: 0.1,
  })

  if (!screenshareVideoTrack)
    return <div
      style={{width:'100%', height:'100%', background: 'rgba(255,255,255,0.5)', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    </div>

  return (
    <video
      ref={videoRef}
      style={{width:'100%', height:'100%', objectFit:'contain'}}
      autoPlay
      muted
      playsInline
    />
  )
}

export function LiveAVScreenShareStopButton() {
  const { toggleScreenShare } = useScreenShare()
  if (!toggleScreenShare) return null
  return <button onClick={() => toggleScreenShare()}>stop screenshare</button>
}