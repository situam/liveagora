import { useReactFlow, useStoreApi } from 'reactflow'
import { isValidNode } from '../util/validators'

export function usePan() {
  const { setCenter } = useReactFlow()
  const rfStore = useStoreApi()

  const getZoom = () => rfStore.getState() ? rfStore.getState().transform[2] : 1

  const panToNode = (node, durationMs=0) => {
    if (!isValidNode(node)) {
      console.error("panToNode: invalid node", node)
      return
    }
    
    setCenter(
      node.position.x+node.width/2,
      node.position.y+node.height/2,
      {
        zoom: getZoom(),
        duration: durationMs
      }
    )
  }

  return { panToNode }
}