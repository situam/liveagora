import { useCallback } from 'react';

import ReactFlow, { Background, ReactFlowProvider, MiniMap, Panel, Controls, ControlButton, useReactFlow } from 'reactflow'
import { nodeTypes } from '../nodeTypes'
import '../reactflow-base.css'
import { useNodeChangeHandler } from '../hooks/useNodeChangeHandler';
import { useNodeDragHandler, useNodeDragStopHandler } from '../hooks/useNodeDragHandler';

import { SharedFlowObserver } from '../observers/SharedFlowObserver';
import { BACKGROUND_BOUNDARY_NODE_ID, SpaceMetadataObserver } from '../observers/SpaceMetadataObserver';
import { LiveAVScreensharePresenceSyncroniser } from '../observers/LiveAVScreensharePresenceSyncroniser';
import { AwarenessObserver } from '../observers/AwarenessObserver';
import { ViewpointChangeLogger } from '../observers/ViewpointObserver';

import { SpaceAwarenessInspector } from './SpaceAwarenessInspector';

import { LiveAVToolbarOrchestrator } from './LocalOrchestrator';
import { Gate } from './Gate'
import { useSpace } from '../context/SpaceContext'
import { useAwareness } from '../hooks/useAwareness'

import { AddNodeToolbar } from './AddNodeToolbar';
import { useNodeDoubleClickHandler } from '../hooks/useNodeDoubleClickHandler';
import { CopyPasteHandler } from './CopyPasteHandler';
import { TagNavigator } from './SpaceNavigator';
import { usePan } from '../hooks/usePan';
import { isValidNode } from '../util/validators';
import { useSpaceAccessControl, AccessRoles, AccessControlDevView, useAgoraAccessControl } from '../context/AccessControlContext';
import { UrlParam } from '../lib/navigate';
import { useSpaceBranding, useSpaceCanvasBounds, useSpaceShowZoomControls } from '../hooks/useLiveMetadata';
import { Branding } from './Branding';
import { TagObserver } from '../observers/TagObserver';
import { useSpaceViewportControls } from '../hooks/useSpaceViewportControls';
import { showAccessControlDevView } from '../AgoraApp';
import { UnlockIcon } from './Icons/Unlock';
import { LockIcon } from './Icons/Lock';
import { FitViewIcon } from './Icons/FitView';
import { useSpaceApi } from '../hooks/useSpaceApi';
import { SpaceInfoSidebarButton } from './SpaceSidebar';
import { SelectedNodesToolbar } from './SelectedNodesToolbar';

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
    <LiveAVScreensharePresenceSyncroniser/>
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
      zoomOnDoubleClick={false}
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
        nodeBorderRadius={0}
        nodeColor={(node)=>{
          if (node.spaceClientID==awareness.clientID)
            return '#f00'

          if (node?.data?.layer==='special')
            return '#f0f'

          if (node?.type=='image' || node?.type=='video' )
            return 'rgba(0,0,0,0.1)'

          if (node?.type=='PadNode')
            return node?.data?.style?.background || 'rgba(0,0,0,0.3)'

          if (node?.type=='RemotePeer' || node?.type=='RemotePeerScreenshare')
            return node?.data?.style?.background
            
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
      <Controls showInteractive={false} showFitView={false} showZoom={showZoomControls}>   
        <FitViewButton/>
        { currentRole.canEdit && <AddNodeToolbar/> }
        <EditModeToggle/>
        <SpaceInfoSidebarButton/>
        { showBranding && <Branding/> }
        { false && <SpaceAwarenessInspector/>} {/* TODO: enable via debug flag*/}
      </Controls>
      <SelectedNodesToolbar/>
      {children}
    </ReactFlow>
  )
}

function FitViewButton() {
  const { fitView } = useReactFlow()
  const spaceApi = useSpaceApi()

  const onFitViewHandler = useCallback(()=>{
    // don't include the background boundary node in fit view calculation
    const nodesToFit = spaceApi.getNodes().filter(n=>n.id !== BACKGROUND_BOUNDARY_NODE_ID)
    fitView({
      nodes: nodesToFit
    })
  }, [])

  return (
    <ControlButton
      className="react-flow__controls-fitview"
      onClick={onFitViewHandler}
      title="fit view"
      aria-label="fit view"
    >
      <FitViewIcon />
    </ControlButton>
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

function EditModeToggle() {
  const space = useSpace()
  const { currentRole, setCurrentRole, authScope, setAuthScope } = useSpaceAccessControl()

  const requestEditAccess = async () => {
    // first try with empty password (in case space is publicly editable)
    let publicEditable = await space.syncProvider.requestEditAccess("")
    if (publicEditable) {
      setAuthScope(AccessRoles.Editor)
      setCurrentRole(AccessRoles.Editor)
      return
    }

    let password = prompt("Enter password to enter edit mode:")
    
    // return early only if user cancels prompt
    if (password == null)
      return

    let success = await space.syncProvider.requestEditAccess(password)
    if (success) {
      setAuthScope(AccessRoles.Editor)
      setCurrentRole(AccessRoles.Editor)
    } else {
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