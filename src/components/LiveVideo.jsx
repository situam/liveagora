import {
  useVideo,
  useHMSStore,
  selectPeers,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectPeerByCondition,
  selectVideoTrackByPeerID
} from '@100mslive/react-sdk';
import { useMemo } from 'react';

import './LiveVideo.css'

export const LiveVideo = ({id, borderRadius}) => {
  //const peers = useHMSStore(selectPeers)
  //const peer = useMemo(()=>peers.find((p)=>p.customerUserId == id), [peers])
  const peer = useHMSStore(selectPeerByCondition(p=>p.customerUserId == id))
  const videoTrack = useHMSStore(selectVideoTrackByPeerID(peer?.id))
  const isPeerMuted = !useHMSStore(selectIsPeerAudioEnabled(peer?.id))
  const isPeerVideoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer?.id))

  const { videoRef } = useVideo({
    trackId: videoTrack?.id,//peer?.videoTrack,
    threshold: 0.1,
  });

  if (!peer || !isPeerVideoEnabled || videoTrack?.degraded)
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
    {/* <pre>{JSON.stringify(videoTrack)}</pre> */}
    </>
  )
}