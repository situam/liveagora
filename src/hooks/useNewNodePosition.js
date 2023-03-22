import { useCallback } from 'react'
import { useStoreApi } from 'reactflow'
import { getViewportCenter } from '../util/getViewportCenter'
import { grid } from '../components/LiveFlow'
import { useAwareness } from './useAwareness'

export function useNewNodePosition() {
  const rfStore = useStoreApi()
  const awareness = useAwareness()

  const getCenterPos = useCallback((width,height) => {
    let center = getViewportCenter(rfStore.getState(), grid)

    return { x: center.x - width, y: center.y - height }
  }, [rfStore])

  const getPos = useCallback((w,h)=>{
    if (awareness.getLocalState()?.position && awareness.getLocalState()?.height) {
      return {
        x: awareness.getLocalState().position.x,
        y: awareness.getLocalState().position.y + awareness.getLocalState().height + 15
      }
    } else {
      return getCenterPos(w,h)
    }
  })

  return getPos
}