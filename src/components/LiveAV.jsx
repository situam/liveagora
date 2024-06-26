import { useCallback } from 'react'

import {
  HMSRoomProvider,
  useHMSStore,
  useHMSVanillaStore,
  useHMSActions,
  selectIsConnectedToRoom,
  selectLocalPeerID,
  selectLocalPeerRoleName,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers
} from '@100mslive/react-sdk';

import { getHmsToken, buildHmsRoleName } from '../util/hmsUtils';

import { useReactFlow } from 'reactflow'

import { useAgora } from '../context/AgoraContext';
import { useSpace } from '../context/SpaceContext';
import { useAwareness } from '../hooks/useAwareness';

import { showLiveAVStats } from '../AgoraApp'


function _shouldEnableAudio(subspace, spaceMetadata) {
  switch (subspace) {
    case 'stage-innercircle':
      if (spaceMetadata.get('onEnterInnerCircleChangeAudio')) {
        return spaceMetadata.get('enterInnerCircleAudio') === true
      }
      break;

    case 'stage':
      if (spaceMetadata.get('onEnterStageChangeAudio')) {
        return spaceMetadata.get('enterStageAudio') === true
      }
      break;
    
    case null:
      if (spaceMetadata.get('onLeaveStageChangeAudio')) {
        return spaceMetadata.get('leaveStageAudio') === true
      }
      break;

    default:
      console.error("[_shouldEnableAudio] unhandled subspace ", subspace);
      return false;
  }
}
function _shouldEnableVideo(subspace, spaceMetadata) {
  switch (subspace) {
    case 'stage-innercircle':
      if (spaceMetadata.get('onEnterInnerCircleChangeVideo')) {
        return spaceMetadata.get('enterInnerCircleVideo') === true
      }
      break;

    case 'stage':
      if (spaceMetadata.get('onEnterStageChangeVideo')) {
        return spaceMetadata.get('enterStageVideo') === true
      }
      break;
    
    case null:
      if (spaceMetadata.get('onLeaveStageChangeVideo')) {
        return spaceMetadata.get('leaveStageVideo') === true
      }
      break;

    default:
      console.error("[_shouldEnableVideo] unhandled subspace ", subspace);
      return false;
  }
}

export function useLiveAVSubspace() {
  const isLiveAVConnected = useHMSStore(selectIsConnectedToRoom);
  const currentHmsRole = useHMSStore(selectLocalPeerRoleName)
  const localPeerId = useHMSStore(selectLocalPeerID)
  const hmsActions = useHMSActions()

  const { getIntersectingNodes } = useReactFlow()
  const space = useSpace()
  const awareness = useAwareness()

  const syncLiveAVWithAwareness = useCallback(async () => {
    console.log('syncLiveAVWithAwareness()')
    if (!isLiveAVConnected)
      return

    let hmsRole = buildHmsRoleName(space.name, awareness.getLocalState().subspace)

    if (hmsRole != currentHmsRole) {
      try {
        console.log("[syncLiveAVWithAwareness] hmsActions.changeRoleOfPeer to", hmsRole)
        hmsActions.changeRoleOfPeer(localPeerId, hmsRole, true)
        
        switch (awareness.getLocalState().subspace) {
          case 'stage-innercircle':
            if (space.metadata.get('onEnterInnerCircleChangeVideo'))
              hmsActions.setLocalVideoEnabled(space.metadata.get('enterInnerCircleVideo'))
            if (space.metadata.get('onEnterInnerCircleChangeAudio'))
              hmsActions.setLocalAudioEnabled(space.metadata.get('enterInnerCircleAudio'))
            break;

          case 'stage':
            if (space.metadata.get('onEnterStageChangeVideo'))
              hmsActions.setLocalVideoEnabled(space.metadata.get('enterStageVideo'))
            if (space.metadata.get('onEnterStageChangeAudio'))
              hmsActions.setLocalAudioEnabled(space.metadata.get('enterStageAudio'))
            break;
          
          case null:
            if (space.metadata.get('onLeaveStageChangeVideo'))
              hmsActions.setLocalVideoEnabled(space.metadata.get('leaveStageVideo'))
            if (space.metadata.get('onLeaveStageChangeAudio'))
              hmsActions.setLocalAudioEnabled(space.metadata.get('leaveStageAudio'))
            break;

          default:
            break;
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [isLiveAVConnected, currentHmsRole, space])

  const checkSubspaceIntersections = useCallback(async () => {
    const localNode = space.awareness.getLocalState()
    const selfRect = {
      x: localNode.position.x,
      y: localNode.position.y,
      width: localNode.width,
      height: localNode.height
    } 
    const subspaceIntersections =
      getIntersectingNodes(selfRect)
        .filter(n=>(n.type=='SubspaceNode'||n.type=='StageNode')&&(!n.hidden))

    if (subspaceIntersections.length < 1) {
      if (awareness.getLocalState()?.subspace) {
        // switch to main space role   
        console.log('switch to main space')     
        awareness.setLocalStateField('subspace', null)
      } 
    } else {
      // should be in or switch to subspace.
      // if subspaces overlap, it tries to select the 'stage-innercircle', if present
      // otherwise it just chooses the first
      const subspace = subspaceIntersections.find(s=>s.data?.subspace=='stage-innercircle') || subspaceIntersections[0]
      
      if (!subspace.data?.subspace)
        throw Error("Invalid subspace")

      if (awareness.getLocalState()?.subspace != subspace.data.subspace) {
        console.log('switch to subspace', subspace.data.subspace)
        awareness.setLocalStateField('subspace', subspace.data.subspace)
      }
    }

    syncLiveAVWithAwareness()
  },
  [isLiveAVConnected, currentHmsRole])

  return { syncLiveAVWithAwareness, checkSubspaceIntersections }
}

/**
 * @return {{leaveLiveAVCall: Function}}
 */
export function useLeaveLiveAV() {
  const isLiveAVConnected = useHMSStore(selectIsConnectedToRoom)
  const hmsActions = useHMSActions()

  const leaveLiveAVCall = () => {
    if (isLiveAVConnected) {
      hmsActions.leave()
    }
  }

  return { leaveLiveAVCall }
}

export function useEnterLiveAVSpace() {
  const agora = useAgora()
  const space = useSpace()

  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const currentHmsRole = useHMSStore(selectLocalPeerRoleName)
  const hmsActions = useHMSActions()

  const hmsStore = useHMSVanillaStore()
  const awareness = useAwareness()

  /**
   * Expose as global window var
   */
  window.leaveLiveAvCall = hmsStore.leave

  const enterLiveAVSpace = async () => {
    try {
      if (!agora.metadata.has('liveAV/roomID'))
        throw Error("cannot join call - liveAV/roomID is not configured")

      let targetHmsRole = buildHmsRoleName(space.name, awareness.getLocalState().subspace)

      if (targetHmsRole == currentHmsRole) {
        console.log('enterLiveAVSpace: no change')
        return
      }

      let enterAudioMuted = true
      let enterVideoMuted = true

      if (isConnected) {
        // remember mute state
        enterAudioMuted = !hmsStore.getState(selectIsLocalAudioEnabled)
        enterVideoMuted = !hmsStore.getState(selectIsLocalVideoEnabled)

        /// due to role change bug, workaround here is to first leave and then join with new role
        await hmsActions.leave();
      }

      console.log('enterLiveAVSpace:', targetHmsRole)
      await hmsActions.join({
        userName: 'notrack',
        authToken: await getHmsToken(agora.metadata.get('liveAV/roomID'), agora.clientID, targetHmsRole),
        settings: {
          isAudioMuted: !_shouldEnableAudio(awareness.getLocalState().subspace, space.metadata), //enterAudioMuted, // TODO consider previous connected audio state and whether change is defined 
          isVideoMuted: !_shouldEnableVideo(awareness.getLocalState().subspace, space.metadata), //enterVideoMuted, // TODO consider previous connected video state and whether change is defined 
        }
      })
    } catch (e) {
      throw Error(e)
    }
  }
  
  return enterLiveAVSpace
}

export function Provider({children}) {
  /**
   * @param {bool} isHMSStatsOn - https://www.100ms.live/docs/javascript/v2/how-to-guides/measure-network-quality-and-performance/stats
   */
  
  return <HMSRoomProvider isHMSStatsOn={showLiveAVStats}>
    {children}
    {
      showLiveAVStats && <div style={{position: 'fixed', top:'50%', background: 'yellow', margin: '15px'}}>showLiveAVStats</div>
    }
  </HMSRoomProvider>
}

export function PeerStatus() {
  const peers = useHMSStore(selectPeers)

  return <div>{JSON.stringify(peers, null, 2)}</div>
}
