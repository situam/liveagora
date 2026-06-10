import { useCallback, useState } from 'react';
import { NodeToolbar, OnSelectionChangeParams, Position, useOnSelectionChange } from "reactflow"

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

  if (selectedNodeIds.length < 2) {
    return null
  }

  return (
    <NodeToolbar
      nodeId={selectedNodeIds}
      isVisible={true}
      position={Position.Bottom}
    >
      <button>delete</button>
    </NodeToolbar>
  )
}
