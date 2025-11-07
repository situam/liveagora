import { SharedFlow } from './LiveFlow'
import { useState } from 'react'

export function GatedSharedFlow({docname}) {
  const [entered, setEntered] = useState(false)
  const [name, setName] = useState("")

  if (!entered)
    return <>
      <input type="text" onChange={(e)=>setName(e.target.value)}></input>
      <button onClick={()=>setEntered(true)}>enter</button>
    </>

  return <SharedFlow docname={docname} awarenessname={name}/>
}
