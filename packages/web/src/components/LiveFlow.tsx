import { useCallback, useEffect, useState } from 'react';

import ReactFlow, { Background, ReactFlowProvider, useStore, useStoreApi, useReactFlow, MiniMap, Panel, useOnSelectionChange, Controls, ControlButton } from 'reactflow'
import { nodeTypes } from '../nodeTypes'
import '../reactflow-base.css'
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
import { useAgora } from '../context/AgoraContext'
import { useAwareness } from '../hooks/useAwareness'

import { AddNodeToolbar } from './AddNodeToolbar';
import { useNodeDoubleClickHandler } from '../hooks/useNodeDoubleClickHandler';
import { CopyPasteHandler } from './CopyPasteHandler';
import { TagNavigator, SpaceNavigator } from './SpaceNavigator';
import { usePan } from '../hooks/usePan';
import { isValidNode } from '../util/validators';
import { useSpaceAccessControl, AccessRoles, AccessControlDevView, useAgoraAccessControl } from '../context/AccessControlContext';
import { UrlParam } from '../lib/navigate';
import { useSpaceBranding, useSpaceCanvasBounds, useSpaceShowZoomControls } from '../hooks/useLiveMetadata';
import { Branding } from './Branding';
import { TagObserver } from '../observers/TagObserver';
import { useSpaceViewportControls } from '../hooks/useSpaceViewportControls';
import { showAccessControlDevView } from '../AgoraApp';

export const GatedSpaceFlow = ({archived}: {archived: boolean}) => {
  return <Gate>
    <SpaceFlow presence={!archived}/>
  </Gate>
}

const viewpointObserverEnabled = true //todo better make this dynamic
const enableTagNavigator = true

export const SpaceFlow = ({presence}) => {
  //const { currentRole } = useSpaceAccessControl()

  return <ReactFlowProvider>
    <Flow nodeTypes={nodeTypes} presence={presence}> 
      { enableTagNavigator &&
      <Panel position={'top-left'}>
        <TagNavigator/>
        { showAccessControlDevView && <AccessControlDevView/> }
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
    <TagObserver/>
  </ReactFlowProvider>
}

export const grid = [15,15]

function Flow({ nodeTypes, children, presence }) {
  const { currentRole } = useSpaceAccessControl()
  const { currentRole: agoraRole } = useAgoraAccessControl()

  const handleNodeChanges = useNodeChangeHandler()
  const { handleNodeDrag, handleSelectionDrag } = useNodeDragHandler(currentRole.canEdit)
  const handleNodeDragStop = useNodeDragStopHandler()
  const handleNodeDoubleClick = useNodeDoubleClickHandler()
  const { setInitialViewport } = useSpaceViewportControls()
  const { panToNode } = usePan();
  const showZoomControls = useSpaceShowZoomControls()
  const showBranding = useSpaceBranding()

  const awareness = useAwareness()

  /**
   * set window variables, useful for inspection/debugging
   * ykv: nodes
   * metadata: space metadata
   */
  const { ykv, metadata } = useSpace()
  window.ykv = ykv
  window.metadata = metadata
  //window.awareness = awareness

  const canvasBounds = useSpaceCanvasBounds()

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
      return
    }

    // otherwise, set viewport according to space settings
    setInitialViewport()
  }, [setInitialViewport, panToNode])

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
      translateExtent={canvasBounds}
      //nodeExtent={canvasBounds}
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
      <Background color={'var(--ux-color-secondary)'} gap={grid[0]} size={1}/>
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
      <Controls showInteractive={false} showFitView={true} showZoom={showZoomControls}>   
        { presence && <LiveAVToolbarOrchestrator/> }
        { currentRole.canEdit && <AddNodeToolbar/> }
        <EditModeToggle/>
        { showBranding && <Branding/> }
        { false && <SpaceAwarenessInspector/>} {/* TODO: enable via debug flag*/}
        { (currentRole.canEdit && agoraRole.canEdit) && <SpaceMetadataPanel/>} {/* show if user has backstage access and can edit the space */}
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

function EditModeToggle() {
  const space = useSpace()
  const { currentRole, setCurrentRole, authScope } = useSpaceAccessControl()

  const requestEditAccess = async () => {
    // first try with empty password (in case space is publicly editable)
    let publicEditable = await space.syncProvider.requestEditAccess("")
    if (publicEditable) {
      return
    }

    let password = prompt("Enter password to enter edit mode:")
    
    // return early only if user cancels prompt
    if (password == null)
      return

    // allow empty strings (in case the space is publicly editable)
    // TODO: refine the public editable flow (ideally, skip the prompt)
    let success = await space.syncProvider.requestEditAccess(password)
    if (!success) {
      alert("wrong password")
    }
  }

  const onToggleEditMode = () => {
    if (currentRole.canEdit) {
      setCurrentRole(AccessRoles.Viewer)
      return
    }
    
    if (!currentRole.canEdit) {
      if (authScope.canEdit) {
        setCurrentRole(AccessRoles.Editor)
      }
      else {
        requestEditAccess()
      }
    }
  };
  
  const label = currentRole.canEdit ? "switch to view mode" : "switch to edit mode"
  return (
    <ControlButton
      className="react-flow__controls-interactive"
      onClick={onToggleEditMode}
      title={label}
      aria-label={label}
    >
      {currentRole.canEdit ? <UnlockIcon /> : <LockIcon />}
    </ControlButton>
  )
}