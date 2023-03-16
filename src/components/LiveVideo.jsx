import {
  useVideo,
  useHMSStore,
  selectPeers
} from '@100mslive/react-sdk';
import { useMemo } from 'react';

import './LiveVideo.css'

export const LiveVideo = (id) => {
  const peers = useHMSStore(selectPeers)
  const peer = useMemo(()=>peers.find((p)=>p.customerUserId == id?.id), [peers])

  const { videoRef } = useVideo({
    trackId: peer?.videoTrack,
    threshold: 0.1,
  });

  if (!peer)
    return null

  return (<>
    <video
      ref={videoRef}
      className={`peer-video ${peer.isLocal ? "local" : ""}`}
      autoPlay
      muted
      playsInline
    />
  </>)
}