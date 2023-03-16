import { useStoreApi } from 'reactflow'
import { useCallback } from 'react'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { getViewportCenter } from '../util/getViewportCenter'
import { grid } from './LiveFlow'

export function AddNodeToolbar() {
  const { addNode } = usePersistedNodeActions()
  const rfStore = useStoreApi()

  const addPadNode = useCallback(()=>{
    let id = `pad_${Math.floor(Math.random()*1000)}`

    let center = getViewportCenter(rfStore.getState(), grid)

    let newNode = {
      id: id,
      type: 'PadNode',
      position: { x: center.x - 30, y: center.y - 30 },
      width: 120,
      height: 120,
    }
    addNode(newNode)
  }, [addNode])

  return (
    <>
      <button onClick={addPadNode}>+pad</button>
    </>
  )
}