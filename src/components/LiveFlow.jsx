import { useCallback } from 'react';

import ReactFlow, { Background, ReactFlowProvider, useStoreApi, MiniMap, Panel, useOnSelectionChange, Controls } from 'reactflow'
import { nodeTypes } from '../nodeTypes'
import 'reactflow/dist/base.css'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions';
import { useNodeChangeHandler } from '../hooks/useNodeChangeHandler';
import { useNodeDragHandler, useNodeDragStopHandler } from '../hooks/useNodeDragHandler';

import { SharedFlowObserver } from '../observers/SharedFlowObserver';
import { LiveAVObserver } from '../observers/LiveAVObserver';
import { AwarenessObserver } from '../observers/AwarenessObserver';

import { SpaceAwarenessInspector } from './SpaceAwarenessInspector';

import { getViewportCenter } from '../util/getViewportCenter';
import { usePanActions } from '../hooks/usePanActions';

import { LiveAVToolbarOrchestrator } from './LocalOrchestrator';
import { Gate, useLiveAwarenessSpace } from './Gate'
import { SpaceMetadataPanel } from './SpaceMetadataPanel';
import { useSpace } from '../context/SpaceContext'

import { backstageEnabled } from '../AgoraApp';
import { AddNodeToolbar } from './AddNodeToolbar';
import { useNodeDoubleClickHandler } from '../hooks/useNodeDoubleClickHandler';

export const GatedSpaceFlow = () => {
  const liveAwarenessSpace = useLiveAwarenessSpace()
  const space = useSpace()

  if (liveAwarenessSpace != space?.name)
    return <Gate/>
  
  return <SpaceFlow/>
}

export const SpaceFlow = () => (
  <ReactFlowProvider>
    <Flow nodeTypes={nodeTypes}>
      <Panel position={'top-left'}>
        <LiveAVToolbarOrchestrator/>
      </Panel>
      {
      backstageEnabled &&
      <Panel position={'top-right'}>
        <SpaceAwarenessInspector/>
        <SpaceMetadataPanel/>
      </Panel>
      }
    </Flow>
    <SharedFlowObserver/>
    <AwarenessObserver/> 
    <LiveAVObserver/>
  </ReactFlowProvider>
)



export const grid = [15,15]

function Flow({ nodeTypes, children }) {
  const { addNode, deleteAllNodes } = usePersistedNodeActions()
  const handleNodeChanges = useNodeChangeHandler()
  const { handleNodeDrag, handleSelectionDrag } = useNodeDragHandler()
  const handleNodeDragStop = useNodeDragStopHandler()
  const handleNodeDoubleClick = useNodeDoubleClickHandler()

  const { panToCenter } = usePanActions()
  const rfStore = useStoreApi()

  console.log("[Flow] hello")

  const makeNewDemoNode = useCallback(()=>{
    let id = `${Math.floor(Math.random()*1000)}`

    let center = getViewportCenter(rfStore.getState(), grid)

    let newNode = {
      id: id,
      type: 'NodeHatcher',
      position: { x: center.x - 30, y: center.y - 30 },
      width: 60,
      height: 60,
    }
    addNode(newNode)
  }, [addNode])

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      snapToGrid={true}
      snapGrid={grid}
      onNodeDrag={handleNodeDrag}
      onNodeDragStop={handleNodeDragStop}
      onSelectionDrag={handleSelectionDrag}
      onNodesChange={handleNodeChanges}
      onNodeDoubleClick={handleNodeDoubleClick}
      //onNodesChange={(e)=>console.log("[onNodesChange]", e)}
      proOptions={{hideAttribution: true}}
      maxZoom={2}
      minZoom={0.5}
      panOnScroll={true}
      onlyRenderVisibleElements={true}
      selectNodesOnDrag={false}
      //elementsSelectable={false}
    >
      <Background color={'rgba(0,255,0)'} gap={grid[0]} size={1}/>
      {/* <MiniMap/> */}
      {/* <Panel position={'bottom-left'}>
        <button onClick={makeNewDemoNode}>
          add
        </button>
        <button onClick={deleteAllNodes}>
          reset
        </button>
        <button onClick={panToCenter}>
          find center
        </button>
      </Panel> */}
      <Controls showInteractive={false}>
        <AddNodeToolbar/>
      </Controls>
      {children}
    </ReactFlow>
  )
}