import { useEffect, useState } from 'react'
import { useSpace } from '../context/SpaceContext'
import { useShapeToggle } from '../hooks/useShapeToggle'
import { useRecorder } from './RecordModal'

import {
	selectIsConnectedToRoom,
  selectLocalPeerRoleName,
  selectIsAllowedToPublish,
	useHMSActions,
	useHMSStore,
  useAVToggle,
  useScreenShare
} from "@100mslive/react-sdk";
import { HMSAudioMode } from '@100mslive/hms-video-store';
import { useEnterLiveAVSpace } from "./LiveAV";

import { highQualityAudio, showLiveAVStats, showRecordingControls } from '../AgoraApp';
import { useAwareness } from '../hooks/useAwareness';
import { useSpaceAccessControl } from '../context/AccessControlContext';
import { useAgora } from '../context/AgoraContext';


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

  const [statusMsg, setStatusMsg] = useState(null)

  const recorder = useRecorder()
  const { presence } = useAgora()

  const { currentRole } = useSpaceAccessControl()

  const joinLiveAV = async () => {
    if (!isLiveAVConnected)
      try {
        setStatusMsg('entering video call...')
        presence.setStatusMsg('(entering call)')
        await enterLiveAVSpace()
        setStatusMsg(null)
        presence.setStatusMsg('')
      } catch (err) {
        console.log(err)
        setStatusMsg(err.message)
        presence.setStatusMsg(null)
      }
    else {
      try {
        setStatusMsg('switching space...')
        presence.setStatusMsg('(switching space)')
        await enterLiveAVSpace()
        setStatusMsg(null)
        presence.setStatusMsg('')
      } catch (err) {
        console.log(err)
        setStatusMsg(err.message)
        presence.setStatusMsg(null)
      }
    }
  }

  useEffect(()=>{
    if (!!space.metadata.get('onEntryJoinLiveAV') || isLiveAVConnected)
      joinLiveAV()
  },[])

  if (!isLiveAVConnected)
    return <>
      <button onClick={toggleShape}>shape</button><br/>
      <button
        className="btn-alert"
        onClick={async () => space.leave()}
      >
        leave
      </button><br/>
      { !statusMsg && <><button onClick={joinLiveAV}>
        enter call
      </button><br/></>}
      {/* {statusMsg && <div style={{opacity: '0.5', fontStyle: 'italic', padding: '5px'}}>{statusMsg}</div>} */}
    </>

  return (
    <>
      <button onClick={toggleShape}>shape</button><br/>
      {
        isAllowedToPublish?.audio && <>
        <button onClick={()=>{
          if (highQualityAudio) {
            console.log("set high quality audio");
            hmsActions.setAudioSettings({audioMode: HMSAudioMode.MUSIC});
          }
          toggleAudio();
        }}>
          {isLocalAudioEnabled ? "mute" : "unmute"}
        </button><br/></>
      }
      { 
        isAllowedToPublish?.video && <>
        <button onClick={toggleVideo}>
          {isLocalVideoEnabled ? "hide" : "show"}
        </button><br/></>
      }
      {
        (isAllowedToPublish?.screen && !amIScreenSharing) && <>
        <button onClick={toggleScreenShare}>share screen</button><br/></>
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
      </button><br/>
      {
        showRecordingControls && <>
        <button onClick={recorder.startRecording}>
          start recording
        </button>
        <button onClick={recorder.stopRecording}>
          stop recording
        </button>
        <br/></>
      }
      {showLiveAVStats && <>
        {currentHmsRole}<br/>
      </>}
    </>
  );
}
