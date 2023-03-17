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

  const checkSubspaceIntersections = useCallback(async () => {
    const localNode = space.awareness.getLocalState()
    const selfRect = {
      x: localNode.position.x,
      y: localNode.position.y,
      width: localNode.width,
      height: localNode.height
    } 
    const subspaceIntersections = getIntersectingNodes(selfRect).filter(n=>n.type=='SubspaceNode'||n.type=='StageNode')

    if (subspaceIntersections.length < 1) {
      if (awareness.getLocalState()?.subspace != null) {
        if (awareness.getLocalState()?.subspace == 'stage') {
          // left the stage
          // should be in or switch to main space
          awareness.setLocalStateField('subspace', null)

          if (space.metadata.get('onLeaveStageChangeSize')) {
            let nextState = {
              ...awareness.getLocalState(),
              width: Math.max(
                parseInt(awareness.getLocalState()?.width) + parseInt(space.metadata.get('leaveStageSizeChange')),
                30),
              height: Math.max(
                parseInt(awareness.getLocalState()?.height) + parseInt(space.metadata.get('leaveStageSizeChange')),
                30)
            }
            console.log("[onLeaveStageChangeSize]", nextState)
            awareness.setLocalState(nextState)
          }

          if (isLiveAVConnected) {
            if (space.metadata.get('onLeaveStageChangeVideo'))
              hmsActions.setLocalVideoEnabled(space.metadata.get('leaveStageVideo'))

            if (space.metadata.get('onLeaveStageChangeAudio'))
              hmsActions.setLocalAudioEnabled(space.metadata.get('leaveStageAudio'))
          }
        } 
        
        // switch to main space role        
        awareness.setLocalStateField('subspace', null)
        console.log("[checkSubspaceIntersections] switch to main space")
        if (isLiveAVConnected) {
          const MAIN_SPACE_HMSROLE = space.name
          try {
            await hmsActions.changeRoleOfPeer(localPeerId, MAIN_SPACE_HMSROLE, true)
          } catch (e) {
            console.error(e)
          }
        }
      } 
    } else {
      const subspace = subspaceIntersections[0]
      
      if (!subspace.data?.subspace)
        throw Error("Invalid subspace")

      if (awareness.getLocalState()?.subspace != subspace.data.subspace) {
        // should be in or switch to subspace
        // overlapping subspaces are not handled -
        // this just handles the first subspace found

        awareness.setLocalStateField('subspace', subspace.data.subspace)
        console.log("[checkSubspaceIntersections] switch to subspace", subspace.data.subspace)
      
        if (subspace.data.subspace == 'stage') {
          // on enter stage
          if (space.metadata.get('onEnterStageChangeSize')) {
            let nextState = {
              ...awareness.getLocalState(),
              width: parseInt(awareness.getLocalState()?.width) + parseInt(space.metadata.get('enterStageSizeChange')),
              height: parseInt(awareness.getLocalState()?.height) + parseInt(space.metadata.get('enterStageSizeChange'))
            }
            console.log("[onEnterStageChangeSize]", nextState)
            awareness.setLocalState(nextState)
          }

          if (isLiveAVConnected) {
            if (space.metadata.get('onEnterStageChangeVideo'))
              hmsActions.setLocalVideoEnabled(space.metadata.get('enterStageVideo'))

            if (space.metadata.get('onEnterStageChangeAudio'))
              hmsActions.setLocalAudioEnabled(space.metadata.get('enterStageAudio'))
          }
        }

        if (isLiveAVConnected) {
          const subspaceHmsRole = space.name + '-' + subspace.data.subspace
          if (currentHmsRole == subspaceHmsRole)
            return
          try {
            await hmsActions.changeRoleOfPeer(localPeerId, subspaceHmsRole, true)
          } catch (e) {
            console.error(e)
          }
        } 
      }
    }
  },
  [isLiveAVConnected, currentHmsRole])

  return checkSubspaceIntersections
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
