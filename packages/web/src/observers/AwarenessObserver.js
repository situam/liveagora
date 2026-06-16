import { useCallback, useEffect } from 'react'
import { useAwareness } from "../hooks/useAwareness"
import { useAgora } from "../context/AgoraContext"
import { useSpace } from "../context/SpaceContext"
import { useStoreApi } from 'reactflow'
import { isValidNode, isSelfAwarenessNode } from '../util/validators'
import { followAwarenessPeer } from '../AgoraApp'

import { internalsSymbol } from 'reactflow'
import { defaultZIndex } from '../consts'

export const AwarenessObserver = () => {
  const agora = useAgora()
  const space = useSpace()
  const awareness = useAwareness()
  const rfStore = useStoreApi()

  const onAwareness = useCallback(({added, updated, removed}) => {
    //console.log("[AwarenessObserver] onAwareness", added, updated, removed)
    const awarenessMap = awareness.getStates()

    rfStore.setState((current)=>{
      let next = new Map(current.nodeInternals)

      added.concat(updated)
        .map(clientID=>awarenessMap.get(clientID))
        .filter(state=>isValidNode(state))
        .forEach((state) => {
          // make a copy
          let node = { ...state } 

          //filter out if in different space
          // if (!node.space)
          //   return

          const _screenshareNodeId = node.id + '.screenshare'
          
          if (node.space != space.name) {
            // clean up if peer in a different space
            if (next.has(node.id))
              next.delete(node.id)
            if (next.has(_screenshareNodeId))
              next.delete(_screenshareNodeId)
            return
          }
          
          // transform for Rf
          if (node.hasOwnProperty('position'))
            node.positionAbsolute = {
              x: node.position.x,
              y: node.position.y
            }

          if (node.hasOwnProperty('width') && node.hasOwnProperty('height'))
            node.style = {
              ...node.style,
              width: node.width,
              height: node.height
            }

          if (isSelfAwarenessNode(node, agora)) {
            node.type = 'LocalPeer'
            node.draggable = true
            node[internalsSymbol] = { z: defaultZIndex.LocalPeer }
          } else {
            node.type = 'RemotePeer'
            node.draggable = false
            node[internalsSymbol] = { z: defaultZIndex.RemotePeer }
          }
          
          node.selectable = false
          next.set(node.id, node)

          // handle add screenshare node
          if (node.hasOwnProperty('screenshare')) {
            let screenshareNode = { ...node.screenshare }
            if (screenshareNode.hasOwnProperty('position')) {
              screenshareNode.positionAbsolute = {
                x: screenshareNode.position.x,
                y: screenshareNode.position.y,
              }
            }
            if (screenshareNode.hasOwnProperty('width') && screenshareNode.hasOwnProperty('height')) {
              screenshareNode.style = {
                ...screenshareNode.style,
                width: screenshareNode.width,
                height: screenshareNode.height
              }
            }
            if (isSelfAwarenessNode(node, agora)) {
              screenshareNode.type = 'LocalPeerScreenshare'
              screenshareNode.draggable = true
            } else {
              screenshareNode.type = 'RemotePeerScreenshare'
              screenshareNode.draggable = false
            }
            screenshareNode[internalsSymbol] = { z: defaultZIndex.Screenshare }
            screenshareNode.selectable = false
            screenshareNode.id = _screenshareNodeId
            next.set(screenshareNode.id, screenshareNode)
          }

          // handle remove screenshare node
          if (!node.hasOwnProperty('screenshare') && next.has(_screenshareNodeId)) {
            next.delete(_screenshareNodeId)
          }
        })

      removed.forEach((spaceClientID) => {
        next.forEach(node=>{
          //console.log(node)
          if (node.spaceClientID == spaceClientID)
            next.delete(node.id)
        })
        //next.delete(`awarenesspeer.${id}`)
      })

      return { nodeInternals: next }
    })
    
    if (followAwarenessPeer) {
      const matches = added.concat(updated)
        .filter(clientID => clientID == followAwarenessPeer)
        .map(clientID=>awarenessMap.get(clientID))

      if (matches.length > 0) {
        if (matches[0].viewport) {
          console.log("set viewport", matches[0].viewport)
          if (window.setVp) {
            window.setVp(matches[0].viewport)
          }
        }
      }
    }

  }, [])
  
  useEffect(()=>{
    // init
    //space.connect()

    console.log("[AwarenessObserver] connect")
    onAwareness({
      added: Array.from(awareness.getStates().keys()),
      updated: [],
      removed: []
    })

    // register observer
    awareness.on('change', onAwareness);

    // remove observer
    return () => {
      console.log("[AwarenessObserver] disconnect")
      awareness.off('change', onAwareness);
    }
  }, [awareness])

  return null
}