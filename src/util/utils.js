import { customAlphabet } from 'nanoid'

/**
 * generates a new node id with format: nodeType_timestamp_nanoid
 * @param {string} nodeType 
 * @returns {string}
 */
export function generateNewNodeId(nodeType){
  const nanoid = customAlphabet('1234567890abcdef', 10)
  return `${nodeType}_${+new Date()}_${nanoid()}`
}


export function generateRandomColor() {
  return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
}
export function generateRandomLightColor() {
  return '#'+(0x1000000+(Math.random()*0.5+0.5)*0xffffff).toString(16).substr(1,6)
}

export function roundToGrid(x, grid) {
  return Math.round(x/grid)*grid
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}