import { useState } from 'react'
import { isCommunityVersion } from '../AgoraApp'

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
        isCommunityVersion
            && <>this is a community version of the live agora, </>
        }
        a project by <a href="https://taat.live" target="_blank" rel="noreferrer">taat</a>.
        for questions and feedback, email <a href="mailto:martin@taat.live" target="_blank" rel="noreferrer">martin@taat.live</a>. we&apos;d love to learn how you are using it.</p>
        <br/>
        <p>live agora last updated 2025.04.13, view <a href="./changelog" target="_blank" rel="noreferrer">changelog</a></p>
        <br/>
        <p><span style={{fontStyle: "italic"}}>initiated by Breg&nbsp;Horemans and Gert-Jan&nbsp;Stam, developed by Martin&nbsp;Simpson, supported by David&nbsp;Martens</span></p>
        
    </>
}