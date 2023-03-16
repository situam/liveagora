import {
  useVideo,
  useHMSStore,
  selectPeers,
  selectIsPeerAudioEnabled
} from '@100mslive/react-sdk';
import { useMemo } from 'react';

import './LiveVideo.css'

export const LiveVideo = ({id, borderRadius}) => {
  const peers = useHMSStore(selectPeers)
  const peer = useMemo(()=>peers.find((p)=>p.customerUserId == id), [peers])
  const isPeerMuted = !useHMSStore(selectIsPeerAudioEnabled(peer?.id));

  const { videoRef } = useVideo({
    trackId: peer?.videoTrack,
    threshold: 0.1,
  });

  if (!peer)
    return null

  return (<>
    <video
      style={{borderRadius, filter: isPeerMuted ? 'grayscale()' : 'none'}}
      ref={videoRef}
      className={"peer-video"}
      autoPlay
      muted
      playsInline
    />
  </>)
}