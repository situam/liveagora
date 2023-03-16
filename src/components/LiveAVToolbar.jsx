import { useCallback } from "react";

import { useAgora } from '../context/AgoraContext'

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

  const agora = useAgora()

  const toggleSharpRound = useCallback(()=>{
    if (!localPeerId) return
    //let node = activeSpace.nodes.get(localPeerId)
    //node.data = { ...node.data, shape: node.data.shape==='sharp'?'round':'sharp'}
    //activeSpace.nodes.set(localPeerId, node)
  },[localPeerId])

  if (!isLiveAVConnected)
    return <button onClick={enterLiveAVSpace}>join call</button>

  return (
    <>
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
        <button onClick={toggleScreenShare /*()=>{toggleScreenShare({systemAudio:'include'})}*/}>
          {amIScreenSharing ? 'stop screenshare' : 'screenshare'}
        </button>
      }
      {/* <button onClick={toggleSharpRound}>
        shape
      </button> */}
      <button
        className="btn-alert"
        onClick={async () => {
          await hmsActions.leave()
        }}
      >
        leave
      </button>
      {currentHmsRole}
    </>
  );
}

export { LiveAVToolbar };
