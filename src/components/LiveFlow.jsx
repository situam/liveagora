import { useCallback, useState } from 'react';

import ReactFlow, { Background, ReactFlowProvider, useStore, useStoreApi, useReactFlow, MiniMap, Panel, useOnSelectionChange, Controls, ControlButton } from 'reactflow'
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

import { AddNodeToolbar } from './AddNodeToolbar';
import { useNodeDoubleClickHandler } from '../hooks/useNodeDoubleClickHandler';
import { CopyPasteHandler } from './CopyPasteHandler';
import { SpaceNavigator } from './SpaceNavigator';
import { usePan } from '../hooks/usePan';
import { isValidNode } from '../util/validators';
import { useAccessControl, AccessRoles } from '../context/AccessControlContext';
import { UrlParam } from '../lib/navigate';

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

export const SpaceFlow = ({editable, presence}) => {
  const { currentRole } = useAccessControl()

  return <ReactFlowProvider>
    <Flow nodeTypes={nodeTypes} editable={editable}>
      { presence &&
      <Panel position={'top-left'}>
        <LiveAVToolbarOrchestrator/>
        { currentRole.canEdit && <SpaceNavigator/> /** @todo make this configurable */ } 
      </Panel>
      }
      {
      currentRole.canManage &&
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
}

export const grid = [15,15]

function Flow({ nodeTypes, children, editable = false }) {
  const { currentRole, setCurrentRole } = useAccessControl()

  const handleNodeChanges = useNodeChangeHandler()
  const { handleNodeDrag, handleSelectionDrag } = useNodeDragHandler(currentRole.canEdit)
  const handleNodeDragStop = useNodeDragStopHandler()
  const handleNodeDoubleClick = useNodeDoubleClickHandler()
  const { setCenter } = useReactFlow();
  const { panToNode } = usePan();

  const awareness = useAwareness()

  /**
   * set window variable ykv, useful for inspection/debugging
   */
  const { ykv } = useSpace()
  window.ykv = ykv

  const editableFlowProps =
    currentRole.canEdit ? {
      onSelectionDrag: handleSelectionDrag,
      onNodesChange: handleNodeChanges,
      onNodeDoubleClick: handleNodeDoubleClick,
      nodesDraggable: true,
      nodesConnectable: true,
      elementsSelectable: true,
    } : {
      nodesDraggable: false,
      nodesConnectable: false,
      elementsSelectable: false,
    }
  
  const onInit = useCallback(()=>{
    console.log("[Flow] init")

    // On load, if url params ?node=<nodeId:string>, pan to node
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(UrlParam.Node)) {
      try {
        const nodeId = urlParams.get(UrlParam.Node)
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
      minZoom={0.25}
      panOnScroll={true}
      /**
       * Capture onNodeClick so that reactflow sets pointerEvents: 'all' on NodeWrapper
       * see https://github.com/xyflow/xyflow/blob/815a38e945f62ec31072ebd0a848d17130e6d4d6/packages/react/src/components/NodeWrapper/index.tsx#L149
       */
      onNodeClick={(e)=>console.log('onNodeClick',e)}
      //panOnDrag={false}
      onlyRenderVisibleElements={true}
      selectNodesOnDrag={false}
      onNodeDrag={handleNodeDrag}         // even in read-only mode, handle drag event for localpeer node
      onNodeDragStop={handleNodeDragStop} // even in read-only mode, handle drag event for localpeer node
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
      <Controls showInteractive={false} >
        {currentRole.canEdit && <AddNodeToolbar/>}
        
        <EditModeToggle
          canEdit={currentRole.canEdit}
          setCanEdit={(canEdit)=>{
           setCurrentRole(canEdit ? AccessRoles.Editor : AccessRoles.Viewer)
          }}
          guardEditMode={editable==false}
        />
      </Controls>
      {children}
    </ReactFlow>
  )
}

/**
 * 
 * @param {ReactFlowState} s 
 * @returns 
 */
const interactiveSelector = (s) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
});

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
      <path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" />
    </svg>
  );
}
function UnlockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
      <path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" />
    </svg>
  );
}

function EditModeToggle({
  canEdit,
  setCanEdit = ()=>alert("not implemented yet"),
  guardEditMode = true
}) {
  const onToggleEditMode = () => {
    if (guardEditMode && !canEdit) {
      /**
       * set flag to not enter password more than once per session
       */
      if (!window.editModeAccessed) {
        let password = prompt("Enter password to enter edit mode:")
        if (!password)
          return
  
        if (password!='blackberry') {
          alert('wrong password')
          return
        }

        window.editModeAccessed = true
      }
    }

    setCanEdit(!canEdit)
  };
  const label = canEdit ? "switch to view mode" : "switch to edit mode"
  return (
    <ControlButton
      className="react-flow__controls-interactive"
      onClick={onToggleEditMode}
      title={label}
      aria-label={label}
    >
      {canEdit ? <UnlockIcon /> : <LockIcon />}
    </ControlButton>
  )
}