import { useCallback } from "react"
import { useStoreApi } from 'reactflow'

export function useNodeChangeHandler() {
  const rfStore = useStoreApi()

  const handleNodeChanges = useCallback((changes)=>{
    //console.log("[handleNodeChanges] ",changes)

    if (typeof changes.find(c=>c.type === 'select') == 'undefined')
      return

    const selectionChanges = changes
      .filter(change=>change.type === 'select')

    rfStore.setState((current)=>{
      let next = new Map(current.nodeInternals)

      selectionChanges.forEach(selectionChange=>{
        next.set(selectionChange.id, {
          ...next.get(selectionChange.id),
          selected: selectionChange.selected
        })
      })

      return { nodeInternals: next }
    })

    
  }, [])

  return handleNodeChanges
}

// export function useNodeChangeHandler() {
//   const { updateNodesThrottled } = usePersistedNodeActions()
//   const awareness = useAwareness()

//   const handleNodeChanges = useCallback((changes)=>{
//     const drags = changes
//       .filter(change=>change.type === 'position'
//         && change.hasOwnProperty('position')
//         && change.hasOwnProperty('dragging'))

//     if (drags.length < 1) return 

//     let awarenessDrag = drags.find(d=>d.id.includes('awarenesspeer.'))

//     if (typeof awarenessDrag != 'undefined')
//     {
//       // check intersections here...
//       awareness.setLocalStateField('position', awarenessDrag.position)
//     }
//     else
//     {
//       let updates = drags.map(drag=>({
//         id: drag.id,
//         update: { position: drag.position }
//       }))

//       if (updates.length > 0)
//         updateNodesThrottled(updates)
//     }
//   }, [updateNodesThrottled, awareness])

//   return handleNodeChanges
// }

