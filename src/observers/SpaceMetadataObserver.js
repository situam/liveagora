import { useEffect} from 'react'
import { useSpaceBackgroundBlend, useSpaceBackground, useSpaceCanvasBounds } from '../hooks/useLiveMetadata'
import { useStoreApi } from 'reactflow'
import { canvasBoundsToWidthHeight } from '../util/utils'

const BACKGROUND_BOUNDARY_NODE_ID = '_boundary'

export const SpaceMetadataObserver = () => {
  const backgroundColor = useSpaceBackground()
  const backgroundBlend = useSpaceBackgroundBlend()
  const canvasBounds = useSpaceCanvasBounds()

  const rfStore = useStoreApi()

  /*
  Handle blending nodes with background (when those nodes have a blend mode other than 'normal')
  by setting/removing a BoundaryNode directly to the reactflow store. The BoundaryNode is set to the
  dimensions of the canvas.
  */
  useEffect(()=>{
    rfStore.setState((current)=>{
      let next = new Map(current.nodeInternals)

      if (backgroundBlend) {

        let { width, height } = canvasBoundsToWidthHeight(canvasBounds)
        let pos = {
          x: canvasBounds[0][0] - 0.5, // offset for background grid
          y: canvasBounds[0][1] - 0.5  // offset for background grid
        }

        // add/update background BoundaryNode
        next.set(BACKGROUND_BOUNDARY_NODE_ID, {
          id: BACKGROUND_BOUNDARY_NODE_ID,
          type: 'BoundaryNode',
          z: -100000,
          position: pos,
          positionAbsolute: pos, // needed for reactflow
          style: {
            pointerEvents: 'none', // make sure not to capture click events, otherwise can't drag and select
            width: width,  // needed for reactflow
            height: height // needed for reactflow
          },
          draggable: false,
          width: width,
          height: height,
        })
      }
      else {
        next.delete(BACKGROUND_BOUNDARY_NODE_ID)
      }

      return { nodeInternals: next }
    })
  },
  [backgroundBlend, canvasBounds])

  /*
  Change the background color
  */
  useEffect(()=>{
    document.querySelector(':root').style.setProperty('--theme-background', backgroundColor)
  },
  [backgroundColor])

  return null
}
