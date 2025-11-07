import { useStoreApi } from "reactflow"
import { useSpace } from "../context/SpaceContext"
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions"
import { useYkv } from "../hooks/useYkv"
import { useCallback, useEffect } from "react"

export function TagObserver() {
  const space = useSpace()
  const tagKv = useYkv(space.tags)

  const { updateNodes } = usePersistedNodeActions()
  const rfStore = useStoreApi()

  useEffect(() => {
    const nodeInternals = rfStore.getState().nodeInternals
    const tagStates = tagKv.state

    // Get all nodes that have tags
    const nodesWithTags = Array.from(nodeInternals.values())
      .filter(node => node.data?.tags && Array.isArray(node.data.tags))

    // Calculate visibility for each node considering ALL tags
    const updates = nodesWithTags.map(node => {
      const nodeTags = node.data.tags

      // Node should be hidden if all of its tags are hidden
      const shouldHide = nodeTags.every(tag => tagStates[tag]?.val === true)

      return {
        id: node.id,
        update: { hidden: shouldHide }
      }
    })

    // Only update if there are changes
    if (updates.length > 0) {
      updateNodes(updates)
    }
  }, [tagKv.state, updateNodes, rfStore])

  return null
}