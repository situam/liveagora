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
import { useEnterLiveAVSpace } from "./LiveAV";

import { backstageEnabled, showRecordingControls } from '../AgoraApp';
import { useAwareness } from '../hooks/useAwareness';


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
  const awareness = useAwareness()

  const setAwarenessCallStatus = (callStatus) => {
    awareness.setLocalStateField('data', {
      ...awareness.getLocalState()?.data,
      callStatus: callStatus
    })
  }

  const joinLiveAV = async () => {
    if (!isLiveAVConnected)
      try {
        setStatusMsg('entering video call...')
        setAwarenessCallStatus('(entering call)')
        await enterLiveAVSpace()
        setStatusMsg(null)
        setAwarenessCallStatus('')
      } catch (err) {
        console.log(err)
        setStatusMsg(err.message)
        setAwarenessCallStatus(null)
      }
    else {
      try {
        setStatusMsg('switching space...')
        setAwarenessCallStatus('(switching space)')
        await enterLiveAVSpace()
        setStatusMsg(null)
        setAwarenessCallStatus('')
      } catch (err) {
        console.log(err)
        setStatusMsg(err.message)
        setAwarenessCallStatus(null)
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
      {statusMsg && <div style={{opacity: '0.5', fontStyle: 'italic', padding: '5px'}}>{statusMsg}</div>}
    </>

  return (
    <>
      <button onClick={toggleShape}>shape</button><br/>
      {
        isAllowedToPublish?.audio && <>
        <button onClick={toggleAudio}>
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
        isAllowedToPublish?.screen && <>
        <button onClick={toggleScreenShare}>
          {amIScreenSharing ? 'stop screenshare' : 'screenshare'}
        </button><br/></>
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
      {backstageEnabled && currentHmsRole}
    </>
  );
}
