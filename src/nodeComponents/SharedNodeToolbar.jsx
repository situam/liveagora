import { useCallback } from 'react'
import { NodeToolbar, Position, useNodeId, useStore } from 'reactflow'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'

export function SharedNodeToolbar({id, data}) {
  const { updateNodeData, deleteNode } = usePersistedNodeActions()

  const onToggleDraggable = useCallback(()=>{
    updateNodeData(id, { frozen: !data?.frozen})
  },
  [data])

  const onDelete = useCallback(()=>{
    deleteNode(id)
  },
  [])

  return (
    <NodeToolbar position={Position.Bottom} offset={10}>
      <button onClick={onToggleDraggable}>{!!data?.frozen ? 'unfreeze' : 'freeze'}</button>
      {
        !data?.frozen &&
        <button onClick={onDelete}>delete</button>
      }
    </NodeToolbar>
  )
}