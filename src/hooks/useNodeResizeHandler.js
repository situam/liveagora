import { useCallback } from "react"
import { usePersistedNodeActions } from "./usePersistedNodeActions"

export function useNodeResizeHandler(nodeId) {
  const { updateNodeThrottled } = usePersistedNodeActions()

  if (!nodeId)
    throw Error("useNodeResizeHandler requires nodeId")

  const handleNodeResizeEvent = useCallback((_, params)=>{
    updateNodeThrottled(nodeId, {
      width: params.width,
      height: params.height,
      position: {
        x: params.x,
        y: params.y,
      },
    })
  }, [updateNodeThrottled, nodeId])

  return handleNodeResizeEvent
}
