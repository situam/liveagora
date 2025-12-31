import { useState, useEffect } from 'react'
import { useAgoraAccessControl } from '../context/AccessControlContext'
import { Agora, Space } from '../agoraHatcher'

/**
 * 
 * @param {Agora} agora 
 * @param {Space[]} spaces 
 * @returns 
 */
export function useCfgSpaces(agora, spaces) {
  // const { currentRole } = useAgoraAccessControl()

  const getInfoPage = () => (
    agora.metadata.get('infopage-enabled') ?
      (agora.metadata.get('infopage-displayName') || agora.name)
    : ''
  )

  const [ cfgSpaces, setCfgSpaces ] = useState(agora.enabledSpaces)
  const [ infoPage, setInfoPage ] = useState(getInfoPage)

  useEffect(()=>{
    const sync = () => {
      setCfgSpaces(agora.enabledSpaces)
      setInfoPage(getInfoPage())
    }

    //observe
    agora.metadata.on('change', sync)

    //stop observing
    return () => agora.metadata.off('change', sync)
  }, [])

  /*useEffect(()=>{
    setCfgSpaces(getCfgSpaces())
  }, [currentRole])*/

  return { infoPage, cfgSpaces }
}