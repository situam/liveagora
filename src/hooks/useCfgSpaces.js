import { useState, useEffect } from 'react'
import { validSpaces } from '../consts'
import { useAccessControl } from '../context/AccessControlContext'

export function useCfgSpaces(agora, spaces) {
  const { currentRole } = useAccessControl()

  const getCfgSpaces = () => {
    let arr = []
    validSpaces.map(s=>{
      if (agora.metadata.get(`${s}-enabled`)) {
        const space = spaces.find(el=>el.name==s)
        space.displayName = agora.metadata.get(`${s}-displayName`) || s
        space.isPublic = agora.metadata.get(`${s}-public`) || false
        space.isPublicEditable = agora.metadata.get(`${s}-publicEditable`) || false
        space.isArchived = agora.metadata.get(`${s}-archived`) || false

        if (currentRole.canManage || space.isPublic)
          arr.push(space)
      }
    })
    return arr
  }
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