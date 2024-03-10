import { useCallback } from 'react'
import { NodeToolbar, Position, useNodeId, useStore } from 'reactflow'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { gestureControlsEnabled } from '../AgoraApp'
import { GestureStatus } from '../components/Gesture'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="10" height="10" >
      <line stroke="#000" strokeWidth="2" x1="0" y1="0" x2="15" y2="15"></line>
      <line stroke="#000" strokeWidth="2" x1="0" y1="15" x2="15" y2="0"></line>
    </svg>
    )
}

export function GestureControls({id, data, type}) {
  const { updateNodeData } = usePersistedNodeActions()
  const agora = useAgora()
  const space = useSpace()

  if (!id)
    throw("error needs id")

  const turnIntoGesture = useCallback(()=>{
    let title = prompt('enter gesture title', data?.gesture?.title)
    if (title == null) return

    let body = prompt('enter gesture body (optional)', data?.gesture?.body)
    if (body == null) return

    const today = new Date().toISOString().split('T')[0]

    let gesture = {
      title,
      body,
      contributors: [agora.getName()],
      date: today,
      status: GestureStatus.draft
    }
    console.log(gesture)

    console.log("updating gesture")
    updateNodeData(id, {gesture: gesture})
  },
  [data])

  const publishGesture = useCallback(async()=>{
    updateNodeData(id, {gesture: {...data.gesture, status: GestureStatus.archiving}})
    const req = `${import.meta.env.VITE_APP_URL}/.netlify/functions/addGesture?gesture=${JSON.stringify(data?.gesture)}&imageUrl=${data.link}&agora=${agora.name}&space=${space.name}&nodeId=${id}`
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

  return <>
    {!data?.gesture && <button onClick={turnIntoGesture}>turn into gesture</button>}
    {(data?.gesture && data?.gesture?.status==GestureStatus.draft) && <button onClick={publishGesture}>publish gesture</button>}
  </>
}

export function SharedNodeToolbar({id, data, type}) {
  const { updateNodeData, updateNodeDataThrottled, deleteNode } = usePersistedNodeActions()

  const onToggleDraggable = useCallback(()=>{
    updateNodeData(id, { frozen: !data?.frozen})
  },
  [data])

  const onDelete = useCallback(()=>{
    deleteNode(id)
  },
  [])

  const showColorControl = (type=='PadNode' || type=='SubspaceNode')
  const showGestureControls = (type=='image' || type=='video' || type=='sound') && gestureControlsEnabled

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
        { showGestureControls && <GestureControls id={id} data={data}/>}
        <button onClick={onToggleDraggable}>{!!data?.frozen ? 'unfreeze' : 'freeze'}</button>
        <button className="react-flow__controls-button btn-alert" onClick={onDelete}><DeleteIcon/></button>
        </>
      } 
    </NodeToolbar>
  )
}