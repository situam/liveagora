import { useCallback } from 'react'
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions"

export function useNodeDoubleClickHandler() {
  const { updateNodeData } = usePersistedNodeActions()

  const onNodeDoubleClick = useCallback((mouseEvent, node)=>{
    //@todo bugfix - why doesn't this fire on subspace nodes??
    
    console.log("[onNodeDoubleClick]", node)
    if (node?.data?.frozen)
      updateNodeData(node.id, { frozen: false })
  },
  [])

  return onNodeDoubleClick
}