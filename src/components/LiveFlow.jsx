import { useCallback } from 'react';

import ReactFlow, { Background, ReactFlowProvider, useStoreApi, useReactFlow, MiniMap, Panel, useOnSelectionChange, Controls } from 'reactflow'
import { nodeTypes } from '../nodeTypes'
import 'reactflow/dist/base.css'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions';
import { useNodeChangeHandler } from '../hooks/useNodeChangeHandler';
import { useNodeDragHandler, useNodeDragStopHandler } from '../hooks/useNodeDragHandler';

import { SharedFlowObserver } from '../observers/SharedFlowObserver';
import { SpaceMetadataObserver } from '../observers/SpaceMetadataObserver';
import { LiveAVObserver } from '../observers/LiveAVObserver';
import { AwarenessObserver } from '../observers/AwarenessObserver';
import { ViewpointChangeLogger } from '../observers/ViewpointObserver';

import { SpaceAwarenessInspector } from './SpaceAwarenessInspector';

import { LiveAVToolbarOrchestrator } from './LocalOrchestrator';
import { Gate, useLiveAwarenessSpace } from './Gate'
import { SpaceMetadataPanel } from './SpaceMetadataPanel';
import { useSpace } from '../context/SpaceContext'
import { useAwareness } from '../hooks/useAwareness'

import { backstageEnabled } from '../AgoraApp';
import { AddNodeToolbar } from './AddNodeToolbar';
import { useNodeDoubleClickHandler } from '../hooks/useNodeDoubleClickHandler';
import { CopyPasteHandler } from './CopyPasteHandler';
import { SpaceNavigator } from './SpaceNavigator';
import { usePan } from '../hooks/usePan';
import { isValidNode } from '../util/validators';

export const GatedSpaceFlow = ({editable, archived}) => {
  const liveAwarenessSpace = useLiveAwarenessSpace()
  const space = useSpace()

  if (archived)
    return <SpaceFlow editable={false} presence={false}/>

  if (liveAwarenessSpace != space?.name)
    return <Gate/>
  
  return <SpaceFlow editable={editable} presence={true}/>
}

const viewpointObserverEnabled = true //todo better make this dynamic

export const SpaceFlow = ({editable, presence}) => (
  <ReactFlowProvider>
    <Flow nodeTypes={nodeTypes} editable={editable}>
      { presence &&
      <Panel position={'top-left'}>
        <LiveAVToolbarOrchestrator/>
        { backstageEnabled && <SpaceNavigator/> /** @todo make this configurable */ } 
      </Panel>
      }
      {
      backstageEnabled &&
      <Panel position={'top-right'}>
        <SpaceAwarenessInspector/>
        <SpaceMetadataPanel/>
      </Panel>
      }
      {
      viewpointObserverEnabled &&
      <ViewpointChangeLogger/>
      }
    </Flow>
    <SpaceMetadataObserver/>
    <SharedFlowObserver/>
    <AwarenessObserver/> 
    <LiveAVObserver/>
    <CopyPasteHandler/>
  </ReactFlowProvider>
)

export const grid = [15,15]

function Flow({ nodeTypes, children, editable }) {
  const handleNodeChanges = useNodeChangeHandler()
  const { handleNodeDrag, handleSelectionDrag } = useNodeDragHandler(editable)
  const handleNodeDragStop = useNodeDragStopHandler()
  const handleNodeDoubleClick = useNodeDoubleClickHandler()
  const { setCenter } = useReactFlow();
  const { panToNode } = usePan();

  const awareness = useAwareness()
  const { ykv } = useSpace()

  const editableFlowProps =
    editable ? {
      onSelectionDrag: handleSelectionDrag,
      onNodesChange: handleNodeChanges,
      onNodeDoubleClick: handleNodeDoubleClick,
    } : {
      elementsSelectable: false,
      //nodesDraggable: false,
    }

  const onInit = useCallback(()=>{
    console.log("[Flow] init")

    // On load, if url params ?node=<nodeId:string>, pan to node
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('node')) {
      try {
        const nodeId = urlParams.get('node')
        const node = ykv.get(nodeId)
        if (isValidNode(node)) {
          panToNode(node)
        }
      } catch (e) {
        console.error('Flow:onInit', e)
      }
    } else {
      // otherwise pan to center
      setCenter(0,0,{zoom:1, duration:0})
    }
  }, [setCenter])

  return (
    <ReactFlow
      //defaultViewport={{x:200,y:200,zoom:1}}
      onInit={onInit}
      nodeTypes={nodeTypes}
      snapToGrid={true}
      snapGrid={grid}
      proOptions={{hideAttribution: true}}
      maxZoom={2}
      minZoom={0.5}
      panOnScroll={true}
      onlyRenderVisibleElements={true}
      selectNodesOnDrag={false}
      onNodeDrag={handleNodeDrag}
      onNodeDragStop={handleNodeDragStop}
      {...editableFlowProps}
    >
      <Background color={'rgba(0,255,0)'} gap={grid[0]} size={1}/>
      <MiniMap
        maskStrokeWidth={15}
        nodeStrokeWidth={15}
        maskColor={'transparent'}
        maskStrokeColor={'#f00'}
        nodeBorderRadius={15}
        nodeColor={(node)=>{
          if (node.spaceClientID==awareness.clientID)
            return '#f00'

          if (node?.data?.layer==='special')
            return '#f0f'

          if (node?.type=='image' || node?.type=='video' )
            return 'rgba(0,0,0,0.1)'

          if (node?.type=='PadNode')
            return node?.data?.style?.background || 'rgba(0,0,0,0.3)'
            
          return 'transparent'
        }}
        nodeStrokeColor={node=>{
          if (node.spaceClientID==awareness.clientID)
            return '#f00'
          
          if (node.type=='SubspaceNode' || node.type=='StageNode')
            return 'blue'

          return 'transparent'
        }}
        position={'bottom-right'}
        pannable
        zoomable
        ariaLabel=''
      />
      <Controls showInteractive={false}>
        {editable && <AddNodeToolbar/>}
      </Controls>
      {children}
    </ReactFlow>
  )
}