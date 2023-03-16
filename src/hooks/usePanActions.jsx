import { useCallback, useEffect } from 'react'
import { useReactFlow, useStoreApi } from 'reactflow'

export function usePanActions() {
  const rf = useReactFlow()
  const rfStore = useStoreApi()

  const getZoom = () => rfStore.getState() ? rfStore.getState().transform[2] : 1

  // what is self ??
  var self = {x: 200, y: 200} //@todo make dynamic

  const panToCenter = useCallback(()=>rf.setCenter(0,0,{ duration: 0, zoom: getZoom()}), [rf])
  const panToSelf = useCallback(()=>rf.setCenter(self.x, self.y,{ duration: 0, zoom: getZoom()}), [rf, self])

  useEffect(()=>{
    if (rf.viewportInitialized)
      panToCenter()
  },[rf])

  return { panToCenter, panToSelf }
}