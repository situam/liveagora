import { useCallback } from 'react';

import ReactFlow, { Background, ReactFlowProvider, useStoreApi, MiniMap, Panel, useOnSelectionChange } from 'reactflow'
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
import * as LiveAV from './LiveAV';
import { LiveAVToolbar } from './LiveAVToolbar'
import { Gate } from './Gate'
import { SpaceMetadataPanel } from './SpaceMetadataPanel';

export const GatedSpaceFlow = () => (
  <Gate>
    <SpaceFlow/>
  </Gate>
)

export const SpaceFlow = () => (
  <ReactFlowProvider>
    <Flow nodeTypes={nodeTypes}>
      <Panel position={'top-left'}>
        <LiveAVToolbar/>
      </Panel>
      <Panel position={'top-right'}>
        <SpaceAwarenessInspector/>
        <SpaceMetadataPanel/>
      </Panel>
    </Flow>
    <SharedFlowObserver/>
    <AwarenessObserver/> 
    <LiveAVObserver/>
  </ReactFlowProvider>
)



const grid = [15,15]

function Flow({ nodeTypes, children }) {
  const { addNode, deleteAllNodes } = usePersistedNodeActions()
  const handleNodeChanges = useNodeChangeHandler()
  const { handleNodeDrag, handleSelectionDrag } = useNodeDragHandler()
  const handleNodeDragStop = useNodeDragStopHandler()

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
      <Panel position={'bottom-left'}>
        <button onClick={makeNewDemoNode}>
          add
        </button>
        <button onClick={deleteAllNodes}>
          reset
        </button>
        <button onClick={panToCenter}>
          find center
        </button>
      </Panel>
      {children}
    </ReactFlow>
  )
}