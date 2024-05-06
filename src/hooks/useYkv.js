import { useState, useEffect, useCallback } from 'react'
import { YKeyValue } from 'y-utility/y-keyvalue'

/**
 * @param {YKeyValue} ykv 
 */
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

/**
 * Subscribe to changes in specific Ykv entry
 * 
 * @param {YKeyValue} ykv 
 * @param {String} entryKey
 * @return entryValue
 */
export function useYkvEntry(ykv, entryKey) {
  const [value, setValue] = useState(()=>ykv.get(entryKey))

  const syncValue = useCallback(() => {
    const latest = ykv.get(entryKey)
    setValue(prev => (prev !== latest ? latest : prev))
  }, [ykv, entryKey])

  useEffect(()=>{
    syncValue()
    ykv.on('change', syncValue)
    return () => ykv.off('change', syncValue)
  }, [syncValue])

  return value
}