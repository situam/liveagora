import { useCallback } from 'react'
import { NodeToolbar, Position, useNodeId, useStore } from 'reactflow'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { GestureStatus } from '../components/Gesture'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'
import { UrlParam, updateUrlParam } from '../lib/navigate'
import { useAccessControl } from '../context/AccessControlContext'
import { showNodeData } from '../AgoraApp'
import { Space } from '../agoraHatcher'

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="10" height="10" >
      <line stroke="#000" strokeWidth="2" x1="0" y1="0" x2="15" y2="15"></line>
      <line stroke="#000" strokeWidth="2" x1="0" y1="15" x2="15" y2="0"></line>
    </svg>
    )
}


function canPublishGesture(data) {
  if (!data)
    return false

  if (!data.title || !data.contributors || !data.date)
    return false

  if (data.gesture?.status == GestureStatus.archiving || data.gesture?.status == GestureStatus.archived)
    return false

  return true
}
/**
 * @param {{title,date,body,contributors,link}} data 
 * @param {string} id - nodeId
 * @param {Space} space
 */
async function publishGesture(data, id, space) {
  if (!canPublishGesture(data))
    throw("error can't publish gesture")

  space.nodeActions.updateNodeData(id, {gesture: {...data.gesture, status: GestureStatus.archiving}})

  const req = `${import.meta.env.VITE_APP_URL}/.netlify/functions/addGesture?gesture=${JSON.stringify({title:data.title,date:data.date,body:data.body,contributors:data.contributors})}&imageUrl=${data.link}&agora=${space.agora.name}&space=${space.name}&nodeId=${id}`
  const res = await fetch(req)
  if (res.status==204) {
    console.log("[publishGesture] success")
  } else {
    console.error("[publishGesture] error", res)
    alert("Couldn't archive. Please check your connection and try again later.")
    space.nodeActions.updateNodeData(id, {gesture: {...data.gesture, status: GestureStatus.draft}})
  }
}
export function GestureControls({id, data, type}) {
  const space = useSpace()

  if (!id)
    throw("error needs id")

  if (canPublishGesture(data))
    return <button onClick={()=>publishGesture(data, id, space)}>publish gesture</button>
  else 
    return null
}

export function NodeMetadataControls({id, data, type}) {
  const { updateNodeData } = usePersistedNodeActions()

  const showGestureControls = (type=='image' || type=='video' || type=='sound')

  const editField = useCallback((field, promptMessage, currentValue, processValue) => {
    let value = prompt(promptMessage, currentValue)
    if (value == null) return
    if (processValue) value = processValue(value)
    updateNodeData(id, { [field]: value })
  }, [data])

  const editTitle = () => editField('title', 'Enter title:', data.title)
  const editHref = () => editField('href', 'Enter href, e.g. https://taat.live/agora/hall09:', data.href)
  const editBody = () => editField('body', 'Enter body:', data.body)
  const editDate = () => {
      const today = new Date().toISOString().split('T')[0]
      const getValidatedDate = (inputDate) => {
          let tempDate = inputDate;
          for (;;) {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(tempDate)) return tempDate;
              tempDate = prompt('Invalid date. Enter date (YYYY-MM-DD):', tempDate);
              if (tempDate == null) throw new Error('Date input cancelled');
          }
      }
      editField('date', 'Enter date (YYYY-MM-DD):', data.date ?? today, getValidatedDate);
  }
  const editContributors = () => editField('contributors', 'Enter contributors (comma separated list)', data.contributors, (value) => value.split(/\s*,+\s*/))

  if (!data) return

  return <>
    {!data.title && <button onClick={editTitle}>+title</button>}
    {!data.href && <button onClick={editHref}>+href</button>}
    {!data.body && <button onClick={editBody}>+body</button>}
    {!data.date && <button onClick={editDate}>+date</button>}
    {!data.contributors && <button onClick={editContributors}>+contributors</button>}
    { showGestureControls && <GestureControls id={id} data={data}/>}
  </>
}

function getNextCssBlendMode(current) {
  switch (current) {
    case 'screen':
      return 'multiply';
    case 'multiply':
      return 'overlay';
    case 'overlay':
      return 'normal';
    case 'normal':
    default:
      return 'screen';
  }
}

function BlendModeButton({nodeId}) {
  const { getNode, updateNode } = usePersistedNodeActions()

  const nextBlendMode = useCallback(()=>{
    const node = getNode(nodeId)
    updateNode(nodeId, { 
      style: {
        ...node.style,
        mixBlendMode: getNextCssBlendMode(node.style?.mixBlendMode)
      }
    })
  }, [])

  return <button onClick={nextBlendMode}>blend</button>
}

function ZIndexButton({nodeId}) {
  const { getNode, updateNode } = usePersistedNodeActions()

  const setZIndex = useCallback(()=>{
    const node = getNode(nodeId)
    let z = parseInt(prompt('Enter z-index (range 1..1000) to control stacking order: ', node.z || 1))
    if (isNaN(z))
      return 
    if (z>1000) z=1000
    if (z<1) z=1

    updateNode(nodeId, { z })
  }, [])

  return <button className="react-flow__controls-button" onClick={setZIndex}>z</button>
}

export function SharedNodeToolbar({id, data, type}) {
  const { updateNodeData, updateNodeDataThrottled, deleteNode } = usePersistedNodeActions()
  const { currentRole } = useAccessControl()

  const onToggleDraggable = useCallback(()=>{
    updateNodeData(id, { frozen: !data?.frozen})
  },
  [data])

  const onDelete = useCallback(()=>{
    deleteNode(id)
  },
  [])

  const showColorControl = (type=='PadNode' || type=='SubspaceNode')

  const onUpdateColor = useCallback((e)=>{
    updateNodeDataThrottled(id, {
      style: {
        ...data?.style,
        background: e.target.value
      }
    })
  },
  [])

  if (!currentRole.canEdit) {
    if (showNodeData) {
      return <NodeToolbar isVisible={true} position={Position.Bottom} offset={10} style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </NodeToolbar>
    } else {
      return null;
    }
  }

  return (
    <NodeToolbar position={Position.Bottom} offset={10} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {
        data?.frozen &&
        <button onClick={onToggleDraggable}>{data?.frozen ? 'unfreeze' : 'freeze'}</button>
      }
      {
        !data?.frozen &&
        <>
        { showColorControl && <input type="color" value={data?.style?.background} onChange={onUpdateColor}/> }
        <BlendModeButton nodeId={id}/>
        <ZIndexButton nodeId={id}/>
        <button onClick={onToggleDraggable}>{data?.frozen ? 'unfreeze' : 'freeze'}</button>
        <button onClick={()=>{updateUrlParam(UrlParam.Node,id)}}>link</button>
        { currentRole.canEdit && <NodeMetadataControls data={data} id={id} type={type}/>}
        <button className="react-flow__controls-button btn-alert" onClick={onDelete}><DeleteIcon/></button>
        </>
      }
      {
        showNodeData &&
        <pre>{JSON.stringify(data, null, 2)}</pre>
      }
    </NodeToolbar>
  )
}