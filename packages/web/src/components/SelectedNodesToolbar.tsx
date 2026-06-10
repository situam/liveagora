import { useCallback, useState } from 'react';
import { NodeToolbar, OnSelectionChangeParams, Position, useOnSelectionChange } from "reactflow"
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions';

/**
 * a toolbar for actions on multiple selected nodes
 */
export function SelectedNodesToolbar() {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeIds(params.nodes.map((node) => node.id))
  }, [])

  useOnSelectionChange({
    onChange: onSelectionChange,
  })

  const { deleteNodes } = usePersistedNodeActions() // TODO: type this

  const onDelete = useCallback(() => {
    if (confirm(`Really delete the selected ${selectedNodeIds.length} elements?`))
      deleteNodes(selectedNodeIds)
  }, [selectedNodeIds])

  if (selectedNodeIds.length < 2) {
    return null
  }

  return (
    <NodeToolbar
      nodeId={selectedNodeIds}
      isVisible={true}
      position={Position.Bottom}
    >
      <button className="btn-alert" onClick={onDelete}>delete</button>
    </NodeToolbar>
  )
}
