import { useCallback } from "react"
import { usePersistedNodeActions } from "./usePersistedNodeActions"
import { useAwareness } from "./useAwareness"
import { useLiveAVSubspace } from "../components/LiveAV"

export function useNodeDragStopHandler() {
  const checkSubspaceIntersections = useLiveAVSubspace()
  
  const handleDragStop = useCallback((mouseEvent, draggedNode, draggedNodes)=>{
    if (draggedNode.type == 'LocalPeer' || draggedNode.type == 'SubspaceNode')
      checkSubspaceIntersections()
  })

  return handleDragStop
}

export function useNodeDragHandler() {
  const { updateNodesThrottled } = usePersistedNodeActions()
  
  const awareness = useAwareness()

  const handleDrags = useCallback((draggedNodes)=>{
    console.log('[handleDrags]', draggedNodes)
    let updates = draggedNodes
      .filter(n=>n.type!=='LocalPeer')
      .map(drag=>({
        id: drag.id,
        update: { position: drag.position }
      }))

    if (updates.length > 0)
      updateNodesThrottled(updates)

    let localPeerDragged = draggedNodes.find(n=>n.type=='LocalPeer')
    if (typeof localPeerDragged != 'undefined') {
      
      awareness.setLocalStateField('position', localPeerDragged.position)
    }
  }, [updateNodesThrottled, awareness])

  const handleNodeDrag = useCallback((mouseEvent, draggedNode, draggedNodes) => {
    handleDrags(draggedNodes)
  }, [handleDrags])

  const handleSelectionDrag = useCallback((mouseEvent, draggedNodes) => {
    handleDrags(draggedNodes)
  }, [handleDrags])

  return { handleNodeDrag, handleSelectionDrag }
}

