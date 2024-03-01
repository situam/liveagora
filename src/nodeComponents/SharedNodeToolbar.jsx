import { useCallback } from 'react'
import { NodeToolbar, Position, useNodeId, useStore } from 'reactflow'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { gestureControlsEnabled } from '../AgoraApp'

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

  if (!id)
    throw("error needs id")

  const turnIntoGesture = useCallback(()=>{
    let gesture = prompt('enter gesture as json', data?.gesture)
    if (gesture == null || gesture == data?.gesture)
      return

      console.log("updating gesture")
    updateNodeData(id, { gesture: gesture})
  },
  [data])

  const publishGesture = useCallback(async()=>{
    const req = `${import.meta.env.VITE_APP_URL}/.netlify/functions/addGesture?gesture=${data?.gesture}&imageUrl=${data.link}`
    console.log("[publishGesture] req:", req)
    const res = await fetch(`${import.meta.env.VITE_APP_URL}/.netlify/functions/addGesture?gesture=${data?.gesture}&imageUrl=${data.link}`)
    console.log("[publishGesture] res:", res)
  },
  [data])

  return <>
    <button onClick={turnIntoGesture}>{data?.gesture ? 'edit gesture' : 'turn into gesture'}</button>
    {data?.gesture && <button onClick={publishGesture}>publish gesture</button>}
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
  const showGestureControls = type=='image' && gestureControlsEnabled

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