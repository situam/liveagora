import { useCallback } from 'react'
import { NodeToolbar, Position, useNodeId, useStore } from 'reactflow'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { GestureStatus } from '../components/Gesture'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'
import { UrlParam, updateUrlParam } from '../lib/navigate'
import { useAccessControl } from '../context/AccessControlContext'

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="10" height="10" >
      <line stroke="#000" strokeWidth="2" x1="0" y1="0" x2="15" y2="15"></line>
      <line stroke="#000" strokeWidth="2" x1="0" y1="15" x2="15" y2="0"></line>
    </svg>
    )
}

export function GestureControls({id, data, type}) {
  if (!data) return null

  const { updateNodeData } = usePersistedNodeActions()
  const agora = useAgora()
  const space = useSpace()

  if (!id)
    throw("error needs id")

  const canPublish = useCallback(()=>{
    if (!data.title || !data.contributors || !data.date)
      return false

    if (data.gesture?.status == GestureStatus.archiving || data.gesture?.status == GestureStatus.archived)
      return false

    return true
  }, [data])

  const publishGesture = useCallback(async()=>{
    updateNodeData(id, {gesture: {...data.gesture, status: GestureStatus.archiving}})
    const req = `${import.meta.env.VITE_APP_URL}/.netlify/functions/addGesture?gesture=${JSON.stringify({title:data.title,date:data.date,body:data.body,contributors:data.contributors})}&imageUrl=${data.link}&agora=${agora.name}&space=${space.name}&nodeId=${id}`
    const res = await fetch(req)
    if (res.status==204) {
      console.log("[publishGesture] success")
    } else {
      console.error("[publishGesture] error", res)
      alert("Couldn't archive. Please check your connection and try again later.")
      updateNodeData(id, {gesture: {...data.gesture, status: GestureStatus.draft}})
    }
  },
  [data])

  if (canPublish())
    return <button onClick={publishGesture}>publish gesture</button>
  else 
    return null
}

export function NodeMetadataControls({id, data, type}) {
  if (!data) return
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
          while (true) {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(tempDate)) return tempDate;
              tempDate = prompt('Invalid date. Enter date (YYYY-MM-DD):', tempDate);
              if (tempDate == null) throw new Error('Date input cancelled');
          }
      }
      editField('date', 'Enter date (YYYY-MM-DD):', data.date ?? today, getValidatedDate);
  }
  const editContributors = () => editField('contributors', 'Enter contributors (comma separated list)', data.contributors, (value) => value.split(/\s*,+\s*/))

  return <>
    {!data.title && <button onClick={editTitle}>+title</button>}
    {!data.href && <button onClick={editHref}>+href</button>}
    {!data.body && <button onClick={editBody}>+body</button>}
    {!data.date && <button onClick={editDate}>+date</button>}
    {!data.contributors && <button onClick={editContributors}>+contributors</button>}
    { showGestureControls && <GestureControls id={id} data={data}/>}
  </>
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

  return (
    <NodeToolbar position={Position.Bottom} offset={10} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {
        data?.frozen &&
        <button onClick={onToggleDraggable}>{!!data?.frozen ? 'unfreeze' : 'freeze'}</button>
      }
      {
        !data?.frozen &&
        <>
        { showColorControl && <input type="color" value={data?.style?.background} onChange={onUpdateColor}/> }
        <button onClick={onToggleDraggable}>{!!data?.frozen ? 'unfreeze' : 'freeze'}</button>
        <button onClick={()=>{updateUrlParam(UrlParam.Node,id)}}>link</button>
        { currentRole.canEdit && <NodeMetadataControls data={data} id={id} type={type}/>}
        <button className="react-flow__controls-button btn-alert" onClick={onDelete}><DeleteIcon/></button>
        </>
      } 
    </NodeToolbar>
  )
}