import React from 'react'
import ReactDOM from 'react-dom/client'

import { AgoraView } from "./components/AgoraView"
import { PasswordGate } from "./components/PasswordGate"
import { hatchAgora } from './agoraHatcher'

import './main.css'

const hocuspocusUrl = import.meta.env.VITE_HOCUSPOCUS_URL

const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
export const backButtonEnabled = urlParams.has('from')
export const backButtonDestination = decodeURIComponent(urlParams.get('from'))
export const followAwarenessPeer = urlParams.get('follow')
export const showRecordingControls = urlParams.has('rec')
export const gestureControlsEnabled = backstageEnabled // TODO find better way to enable this

/*
Load agora with either taat.live/agora/?agora=basename
or taat.live/agora/basename
*/
let base = urlParams.get('agora')
if (!base) {
  if (window.location.pathname.length > 1) {
    // get base from pathname
    base = window.location.pathname.replace(/^\/|\/$/g, '');

    // in case loading from taat.live/agora/basename, remove prefix
    const prefix = "agora/";
    if (base.startsWith(prefix)) {
      base = base.substring(prefix.length);
    }
  } else {
    // if no basename specified, load the welcome agora
    base = 'welcome'
  }  
}

if (base) {
  console.log(`live agora: loading ${base}`)

  const onAgoraLoaded = () => {
    if (baseAgora.metadata.get('passwordEnabled'))
      ReactDOM.createRoot(document.getElementById('root')).render(
        <PasswordGate>
          <AgoraView agora={baseAgora} spaces={spaces}/>
        </PasswordGate>
      )      
    else
      ReactDOM.createRoot(document.getElementById('root')).render(
        //<React.StrictMode>
          <AgoraView agora={baseAgora} spaces={spaces}/>
        //</React.StrictMode>
      )
  }
  const { baseAgora, spaces } = hatchAgora(base, hocuspocusUrl, onAgoraLoaded)

} else {
  document.getElementById('root').innerHTML = `
  <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
    link is invalid!
  </div>
  `
}