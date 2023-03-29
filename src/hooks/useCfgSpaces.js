import { useState, useEffect } from 'react'
import { validSpaces } from '../consts'

export function useCfgSpaces(agora, spaces) {
  const [ cfgSpaces, setCfgSpaces ] = useState([])
  const [ infoPage, setInfoPage ] = useState('')

  useEffect(()=>{
    const sync = () => {
      let arr = []

      setInfoPage(
        agora.metadata.get('infopage-enabled') ?
          (agora.metadata.get('infopage-displayName') || agora.name)
        : ''
      )

      validSpaces.map(s=>{
        if (agora.metadata.get(`${s}-enabled`)) {
          const space = spaces.find(el=>el.name==s)
          space.displayName = agora.metadata.get(`${s}-displayName`) || s
          arr.push(space)
        }
      })
      setCfgSpaces(arr)
    }

    //init 
    sync()

    //observe
    agora.metadata.on('change', sync)

    //stop observing
    return () => agora.metadata.off('change', sync)
  }, [])

  return { infoPage, cfgSpaces }
}