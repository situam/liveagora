import { useSpace } from "../context/SpaceContext"
import { useState, useEffect } from "react"

export function useLiveMetadata() {
  const [state, setState] = useState({})
  const { metadata } = useSpace()

  useEffect(()=>{
    const syncState = () => {
      setState(Object.fromEntries(metadata.map.entries()))
    }

    //init
    syncState()
    
    //start observing
    metadata.on('change', syncState)

    //stop obsering
    return ()=>metadata.off('change', syncState)
  }, [metadata])

  return state
}