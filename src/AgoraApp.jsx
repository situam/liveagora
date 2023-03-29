import React from 'react'
import ReactDOM from 'react-dom/client'

import { AgoraView } from "./components/AgoraView"
import { PasswordGate } from "./components/PasswordGate"
import { hatchAgora } from './agoraHatcher'

import './main.css'


const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
const base = urlParams.get('agora')

if (base) {
  const { baseAgora, spaces } = hatchAgora(base, 'wss://hocuspocus.taat.live')

  ReactDOM.createRoot(document.getElementById('root')).render(
    //<React.StrictMode>
    //  <PasswordGate>
        <AgoraView agora={baseAgora} spaces={spaces}/>
    //  </PasswordGate>
    //</React.StrictMode>
  )
} else {
  document.getElementById('root').innerHTML = `
  <div style="height: 100%; display: flex; align-items: center; justify-content: center; ">
    link is invalid!
  </div>
  `
}

