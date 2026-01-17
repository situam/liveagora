import { useState } from 'react'
import { Env } from '../config/env'

export function Branding() {
  const [ dialogVisible, setDialogVisible ] = useState(false)

  return (
    <>
    {
      dialogVisible && 
      <div onClick={()=>setDialogVisible(false)} style={{background: 'var(--theme-alpha-color)', position: 'fixed', top: 0, left: 0, zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <form onClick={e => e.stopPropagation()}>
          <BrandingDialog/>
        </form>
      </div>
    }
    <button onClick={()=>setDialogVisible(!dialogVisible)}>
        ? 
    </button>
    </>
  )
}

export function BrandingDialog() {
    return <>
        <h2>live agora</h2>
        
        <p>
        {
          Env.isCommunityVersion
            && <>this is a community version of the live agora, </>
        }
        a project by <a href="https://taat.live" target="_blank" rel="noreferrer">taat</a>.
        for questions and feedback, email <a href="mailto:agora@taat.live" target="_blank" rel="noreferrer">agora@taat.live</a>. we&apos;d love to learn how you are using it.</p>
        <br/>
        <p>live agora last updated 2026.01.17, view <a href={`${Env.baseUrl}changelog.txt`} target="_blank" rel="noreferrer">changelog</a></p>
        <br/>
        <p><span style={{fontStyle: "italic"}}>initiated by Breg&nbsp;Horemans and Gert-Jan&nbsp;Stam, developed by Martin&nbsp;Simpson, supported by David&nbsp;Martens</span></p>
        
    </>
}