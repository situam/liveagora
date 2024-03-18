import React from 'react'
import ReactDOM from 'react-dom/client'

import { AgoraViewWithAccessControl } from "./components/AgoraView"
import { PasswordGate } from "./components/PasswordGate"
import { hatchAgora } from './agoraHatcher'
import { updateUrlAgora } from './lib/navigate'

import './main.css'

const hocuspocusUrl = import.meta.env.VITE_HOCUSPOCUS_URL

const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
export const backButtonEnabled = urlParams.has('from')
export const backButtonDestination = decodeURIComponent(urlParams.get('from'))
export const followAwarenessPeer = urlParams.get('follow')
export const showRecordingControls = urlParams.has('rec')

/**
 * show live AV stats (useful for debugging)
 */
export const showLiveAVStats = urlParams.has('showliveavstats')

/**
 * show node data (useful for debugging)
 */
export const showNodeData = urlParams.has('showNodeData')


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

/**
 * Root for ReactDOM
 */
let root = null

/**
 * Loads Agora, can be called multiple times. If a name was already set, the name stays.
 * @param {string} agoraName 
 * @param {Object} opts
 * @param {string?} options.space
 */
window.loadAgora = (agoraName, opts = {space: null}) => {
  console.log(`loadAgora ${agoraName}, opts: ${opts}`)
  let name = null

  /**
   * unload if another agora already loaded
   */
  if (root) {
    if (window.agora) {
      // todo keep other awareness data? size, color, etc
      name = window.agora.getName() // keep name
    }
    root.unmount()

    updateUrlAgora(agoraName)
  }
  root = ReactDOM.createRoot(document.getElementById('root'))
  
  root.render(
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <h1>loading {agoraName}...</h1>
    </div>
  )

  const onAgoraLoaded = () => {
    if (opts.space) baseAgora.awareness.setLocalStateField('space', opts.space)
    if (name) baseAgora.setName(name)

    const content = baseAgora.metadata.get('passwordEnabled') ? (
      <PasswordGate>
        <AgoraViewWithAccessControl key={baseAgora.name} agora={baseAgora} spaces={spaces} />
      </PasswordGate>
    ) : (
      <AgoraViewWithAccessControl key={baseAgora.name} agora={baseAgora} spaces={spaces} />
    );

    root.render(content)
  }
  const { baseAgora, spaces } = hatchAgora(agoraName, hocuspocusUrl, onAgoraLoaded)

  /**
   * set window.agora variable, useful for inspection/debugging
   */
  window.agora = baseAgora
}

if (base) {
  window.loadAgora(base)
} else {
  document.getElementById('root').innerHTML = `
  <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
    link is invalid!
  </div>
  `
}