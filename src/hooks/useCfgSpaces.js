import { useState, useEffect } from 'react'
import { useAccessControl } from '../context/AccessControlContext'
import { Agora, Space } from '../agoraHatcher'

/**
 * 
 * @param {Agora} agora 
 * @param {Space[]} spaces 
 * @returns 
 */
export function useCfgSpaces(agora, spaces) {
  const { currentRole } = useAccessControl()

  const getCfgSpaces = () => spaces.filter((space) => 
      space.isEnabled 
      && (currentRole.canManage || space.isPublic )
    )
  const getInfoPage = () => (
    agora.metadata.get('infopage-enabled') ?
      (agora.metadata.get('infopage-displayName') || agora.name)
    : ''
  )

  const [ cfgSpaces, setCfgSpaces ] = useState(getCfgSpaces)
  const [ infoPage, setInfoPage ] = useState(getInfoPage)

  useEffect(()=>{
    const sync = () => {
      setCfgSpaces(getCfgSpaces())
      setInfoPage(getInfoPage())
    }

    //observe
    agora.metadata.on('change', sync)

    //stop observing
    return () => agora.metadata.off('change', sync)
  }, [])

  useEffect(()=>{
    setCfgSpaces(getCfgSpaces())
  }, [currentRole])

  return { infoPage, cfgSpaces }
}