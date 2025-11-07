import { getRectOfNodes, useReactFlow } from "reactflow"
import { useSpace } from "../context/SpaceContext"
import { grid } from "../components/LiveFlow"
import { isValidNode } from "../util/validators"

export function useSpaceViewportControls() {
    const { setCenter, setViewport, fitView } = useReactFlow()
    const space = useSpace()

    const setInitialViewport = () => {
        // on load, if the space metadata has configured initial FitViewOptions, use them
        const initFitView = space?.metadata.get('initFitView')
        if (initFitView) {
          fitView(initFitView)
          return
        }
    
        // otherwise pan to center
        const initCenterView = space?.metadata.get('initCenterView') !== false
        if (initCenterView) {
          setCenter(0,0,{zoom:1, duration:0})
          return
        }
    
        // otherwise align with top-left of all nodes
        const nodes = Array.from(space?.ykv.map.values()).map(v=>v.val).filter(isValidNode)
        if (nodes.length>0) {
          const rect = getRectOfNodes(nodes)
          setViewport({
            x: -rect.x + grid[0], // bit of padding
            y: -rect.y + grid[0], // bit of padding
            zoom: 1 // must be 1, since origin is 0,0
          })
          return
        }

        // otherwise align top-left at 0,0 with zoom 1
        setViewport({ x: 0, y: 0, zoom: 1 })
    }

    return {
        setInitialViewport
    } 
}