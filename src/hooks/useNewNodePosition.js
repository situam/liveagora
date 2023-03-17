import { useCallback } from 'react'
import { useStoreApi } from 'reactflow'
import { getViewportCenter } from '../util/getViewportCenter'
import { grid } from '../components/LiveFlow'

export function useNewNodePosition() {
  const rfStore = useStoreApi()

  const getPos = useCallback((width,height) => {
    let center = getViewportCenter(rfStore.getState(), grid)

    return { x: center.x - width, y: center.y - height }
  }, [rfStore])

  return getPos
}