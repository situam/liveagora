import {
  useVideo,
  useHMSStore,
  selectIsPeerAudioEnabled,
  selectPeerByCondition,
  selectVideoTrackByPeerID,
  selectConnectionQualityByPeerID,
  selectHMSStats,
  useHMSStatsStore
} from '@100mslive/react-sdk';

import { showLiveAVStats } from '../AgoraApp';
import './LiveVideo.css'

export const LiveVideo = ({id, borderRadius}) => {
  const peer = useHMSStore(selectPeerByCondition(p=>p.customerUserId == id))
  const videoTrack = useHMSStore(selectVideoTrackByPeerID(peer?.id))
  const isPeerMuted = !useHMSStore(selectIsPeerAudioEnabled(peer?.id))

  const { videoRef } = useVideo({
    trackId: videoTrack?.id,
  });

  return (<>
    <video
      style={{borderRadius, filter: isPeerMuted ? 'grayscale()' : 'none'}}
      ref={videoRef}
      className={"peer-video"}
      autoPlay
      muted
      playsInline
    />
    {
      showLiveAVStats && <LiveVideoStats peer={peer} videoTrack={videoTrack}/>
    }
    </>
  )
}

const LiveVideoStats = ({peer, videoTrack}) => {
  const downlinkQuality = useHMSStore(selectConnectionQualityByPeerID(peer?.id))?.downlinkQuality;
  return <div>
    <p>videoTrack.degraded: {videoTrack?.degraded}</p>
    <p>downlinkQuality: {downlinkQuality}</p>
    {false && <VerboseHmsTrackStats trackID={videoTrack?.id}/>}
  </div>
}

const VerboseHmsTrackStats = ({trackID}) => {
  const trackStats = useHMSStatsStore(selectHMSStats.trackStatsByID(trackID));
  
  return <pre>TrackStats: {JSON.stringify(trackStats, null, 2)}</pre>
};

/*
const renderTrackStats = (trackStats) => {
    if (!trackStats) return;
    console.log('Stat Type', trackStats.type); // 'outbound-rtp' for local tracks, 'inbound-rtp' for remote tracks
    console.log('Track Type', trackStats.kind); // 'video' | 'audio'
    console.log('Bitrate', trackStats.bitrate);
    console.log('Packets Lost', trackStats.packetsLost);
    console.log('Packets Lost Rate', trackStats.packetsLostRate);
    console.log('Jitter', trackStats.jitter);

    const isLocal = trackStats.type.includes('outbound');
    if (isLocal) {
        console.log('Bytes Sent', trackStats.bytesSent);
    } else {
        console.log('Bytes Received', trackStats.bytesReceived);
    }

    if (trackStats.kind === 'video') {
        console.log('Frame Width', trackStats.frameWidth);
        console.log('Frame Height', trackStats.frameHeight);
        console.log('Framerate', trackStats.framesPerSecond);

        if (isLocal) {
            console.log('Quality Limitation Reason', trackStats.qualityLimitationReason);
        }
    }
};
*/