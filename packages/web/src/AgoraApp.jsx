import './main.css'

// TODO: cleaner config: move the rest to config/urlparams

const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
export const backButtonEnabled = urlParams.has('from')
export const backButtonDestination = decodeURIComponent(urlParams.get('from'))
export const followAwarenessPeer = urlParams.get('follow')
export const showRecordingControls = urlParams.has('rec')
export const highQualityAudio = urlParams.has('music')

export const defaultAwarenessOptions = {
  name: urlParams.get('name') || '',
  space: urlParams.get('space'),
}

export const padOptions = {
  autolink: urlParams.has('autolink') ? urlParams.get('autolink') === 'true' : true
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