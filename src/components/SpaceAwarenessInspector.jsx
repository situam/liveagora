import { useState } from 'react'
import { useAwareness } from "../hooks/useAwareness"
import { useSpace } from "../context/SpaceContext"
import { ObjectInspector } from "react-inspector"
import { FlowInspector } from "./FlowInspector"
//import { useSyncedStore } from '@syncedstore/react'

export const SpaceAwarenessInspector = () => {
  const [visible, setVisible] = useState(false)

  const awareness = useAwareness()
  const space = useSpace()
  //const { metadata } = useSyncedStore(space.metadata)

  if (!awareness || !space)
    return null

  if (!visible)
    return <button onClick={()=>{
      setVisible(true)
    }}>inspect</button>

  return <>
    <button onClick={()=>setVisible(false)}>hide</button>
    <FlowInspector/>
    <ObjectInspector data={{
      awareness: awareness.getStates(),
      spaceYkv: space.ykv.map,
      spaceMetadata: space.metadata.map
    }}/>
  </>
}
