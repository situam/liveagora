import { Env } from '../config/env'

export function Branding() {
  return (
    <>
      <dialog id="info-dialog" popover="auto">
        <BrandingDialog/>
      </dialog>
      <button popovertarget="info-dialog">
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
        <p>live agora last updated 2026.02.02, view <a href={`${Env.baseUrl}changelog.txt`} target="_blank" rel="noreferrer">changelog</a></p>
        <br/>
        <p><span style={{fontStyle: "italic"}}>initiated by Breg&nbsp;Horemans and Gert-Jan&nbsp;Stam, developed by Martin&nbsp;Simpson, supported by David&nbsp;Martens</span></p>
        
    </>
}