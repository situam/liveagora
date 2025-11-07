
import { useSpace } from '../context/SpaceContext'
import { useShapeToggle } from '../hooks/useShapeToggle'

import {
	selectIsConnectedToRoom,
  selectLocalPeerID,
  selectLocalPeerRoleName,
  selectIsAllowedToPublish,
	useHMSActions,
	useHMSStore,
  useAVToggle,
  useScreenShare
} from "@100mslive/react-sdk";
import { useEnterLiveAVSpace } from "./LiveAV";


function LiveAVToolbar() {
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
  const localPeerId = useHMSStore(selectLocalPeerID);

  const space = useSpace()
  const toggleShape = useShapeToggle()

  if (!isLiveAVConnected)
    return <>
      <button onClick={toggleShape}>shape</button>
      <button onClick={enterLiveAVSpace}>join call</button>
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
        <button onClick={async ()=>{await toggleScreenShare()}/*()=>{toggleScreenShare({systemAudio:'include'})}*/}>
          {amIScreenSharing ? 'stop screenshare' : 'screenshare'}
        </button>
      }
      <button
        className="btn-alert"
        onClick={async () => {
          hmsActions.leave()
          space.leave()
          //await hmsActions.leave()
        }}
      >
        leave
      </button>
      {currentHmsRole}
    </>
  );
}

export { LiveAVToolbar };
