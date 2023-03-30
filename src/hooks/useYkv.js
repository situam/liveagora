import { useState, useEffect } from 'react'

export function useYkv(ykv) {
  const [state, setState] = useState({})

  useEffect(()=>{
    const syncState = () => setState(Object.fromEntries(ykv.map.entries()))

    syncState()
    ykv.on('change', syncState)
    return () => ykv.off('change', syncState)
  }, [ykv])

  return { state, ykv }
}