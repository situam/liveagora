import { useCallback } from 'react'

import {
  HMSRoomProvider,
  useHMSStore,
  useHMSActions,
  selectIsConnectedToRoom,
  selectLocalPeerID,
  selectLocalPeerRoleName,
  selectPeers
} from '@100mslive/react-sdk';

import { getHmsToken } from '../util/hmsUtils';

import { useReactFlow } from 'reactflow'

import { useAgora } from '../context/AgoraContext';
import { useSpace } from '../context/SpaceContext';
import { useAwareness } from '../hooks/useAwareness';

export function useLiveAVSubspace() {
  const isLiveAVConnected = useHMSStore(selectIsConnectedToRoom);
  const currentHmsRole = useHMSStore(selectLocalPeerRoleName)
  const localPeerId = useHMSStore(selectLocalPeerID)
  const hmsActions = useHMSActions()

  const { getIntersectingNodes } = useReactFlow()
  const space = useSpace()
  const awareness = useAwareness()

  const syncLiveAVWithAwareness = useCallback(async () => {
    if (!isLiveAVConnected)
      return
    
    let hmsRole = space.name
    if (awareness.getLocalState().subspace)
      hmsRole += '-' + awareness.getLocalState().subspace

    if (hmsRole != currentHmsRole) {
      console.log("[syncLiveAVWithAwareness] to", hmsRole)
      try {
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

export function useEnterLiveAVSpace() {
  const agora = useAgora()
  const space = useSpace()
  const hmsRole = space.name

  const localPeerId = useHMSStore(selectLocalPeerID);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions()

  const enterLiveAVSpace = async () => {
    try {
      if (isConnected) {
        // switch 'roles'
        await hmsActions.changeRoleOfPeer(localPeerId, hmsRole, true)
        await hmsActions.setLocalVideoEnabled(false)
        await hmsActions.setLocalAudioEnabled(false)
      } else {
        // join
        await hmsActions.join({
          userName: 'notrack',
          authToken: await getHmsToken(agora.name, agora.clientID, hmsRole),
          settings: {
            isAudioMuted: true,
            isVideoMuted: true,
          }
        })
      }
    } catch (e) {
      throw Error(e)
    }
  }
  
  return enterLiveAVSpace
}

export function Provider({children}) {
  return <HMSRoomProvider>{children}</HMSRoomProvider>
}

export function PeerStatus() {
  const peers = useHMSStore(selectPeers)

  return <div>{JSON.stringify(peers, null, 2)}</div>
}
