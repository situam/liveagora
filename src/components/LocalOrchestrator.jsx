import { useEffect } from 'react'
import { useSpace } from '../context/SpaceContext'
import { useShapeToggle } from '../hooks/useShapeToggle'

import {
	selectIsConnectedToRoom,
  selectLocalPeerRoleName,
  selectIsAllowedToPublish,
	useHMSActions,
	useHMSStore,
  useAVToggle,
  useScreenShare
} from "@100mslive/react-sdk";
import { useEnterLiveAVSpace } from "./LiveAV";


export function LiveAVToolbarOrchestrator() {
  const {
    isLocalAudioEnabled,
    isLocalVideoEnabled,
    toggleAudio,
    toggleVideo
  } = useAVToggle();
  const currentHmsRole = useHMSStore(selectLocalPeerRoleName)
  const { amIScreenSharing, toggleScreenShare } = useScreenShare();
  const isAllowedToPublish = useHMSStore(selectIsAllowedToPublish);

  const enterLiveAVSpace = useEnterLiveAVSpace()

  const isLiveAVConnected = useHMSStore(selectIsConnectedToRoom);
	const hmsActions = useHMSActions();

  const space = useSpace()
  const toggleShape = useShapeToggle()

  useEffect(()=>{
    if (!isLiveAVConnected)
      enterLiveAVSpace()
  },[])

  if (!isLiveAVConnected)
    return <>
      <button onClick={toggleShape}>shape</button>
      <button
        className="btn-alert"
        onClick={async () => {
          //leave LiveAV AND space flow
          hmsActions.leave()
          space.leave()
        }}
      >
        leave
      </button>
      <div style={{opacity: '0.5', fontStyle: 'italic', padding: '5px'}}>joining video call...</div>
    </>

  return (
    <>
      <button onClick={toggleShape}>shape</button>
      {
        isAllowedToPublish?.audio &&
        <button onClick={toggleAudio}>
          {isLocalAudioEnabled ? "mute" : "unmute"}
        </button>
      }
      { 
        isAllowedToPublish?.video &&
        <button onClick={toggleVideo}>
          {isLocalVideoEnabled ? "hide" : "show"}
        </button>
      }
      {
        isAllowedToPublish?.screen &&
        <button onClick={toggleScreenShare}>
          {amIScreenSharing ? 'stop screenshare' : 'screenshare'}
        </button>
      }
      <button
        className="btn-alert"
        onClick={async () => {
          //leave LiveAV AND space flow
          hmsActions.leave()
          space.leave()
        }}
      >
        leave
      </button>
      {/* {currentHmsRole} */}
    </>
  );
}
