import './main.css'
import { AwarenessState } from './model/AwarenessState';
import { generateRandomColor } from './util/utils';

// TODO: cleaner config: move the rest to config/urlparams

const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
export const backButtonEnabled = urlParams.has('from')
export const backButtonDestination = decodeURIComponent(urlParams.get('from'))
export const followAwarenessPeer = urlParams.get('follow')
export const showRecordingControls = urlParams.has('rec')
export const highQualityAudio = urlParams.has('music')

export let agoraPresenceMemory: AwarenessState | undefined
export function setAgoraPresenceMemory(state: AwarenessState) {
  agoraPresenceMemory = state
}

export const getDefaultAwarenessOptions = () => ({
  name: urlParams.get('name') || agoraPresenceMemory?.data.name || '',
  space: urlParams.get('space'),
  width: agoraPresenceMemory?.width || 120,
  height: agoraPresenceMemory?.height || 120,
  style: agoraPresenceMemory?.data.style || {
    background: generateRandomColor(),
    borderRadius: '50%'
  }
})

export const padOptions = {
  autolink: urlParams.has('autolink') ? urlParams.get('autolink') === 'true' : true,
  linkControls: urlParams.has('linkControls') ? urlParams.get('linkControls') === 'true' : false,
}

/**
 * show live AV stats (useful for debugging)
 */
export const showLiveAVStats = urlParams.has('showliveavstats')

/**
 * show node data (useful for debugging)
 */
export const showNodeData = urlParams.has('showNodeData')

/**
 * show access control dev view (useful for debugging)
 */
export const showAccessControlDevView = urlParams.has('showAccessControl')

/**
 * enable controls for ImagesNode (next/prev buttons and keyboard navigation)
 */
export const enableImagesNodeControls = urlParams.has('enableSlideControls')