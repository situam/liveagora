export const isValidNode = (node) => {
  return (node?.id && (typeof node?.id === 'string') && node?.position) || false
}

export const isSelfAwarenessNodeId = (id, agora) => {
  if (!id)
    return false

  if (!id.includes("awarenesspeer."))
    return false
  
  const awarenessID = parseInt(id.split('.')[1])

  return awarenessID == agora.clientID
}

export const isSelfAwarenessNode = (node, agora) => isSelfAwarenessNodeId(node?.id, agora)

/**
 * Validates type [[number, number], [number, number]]
 * @param {any} value
 * @returns {boolean}
 */
export const isValidCoordinateExtent = (value) => {
  if (!Array.isArray(value) || value.length !== 2) {
      return false
  }

  for (let item of value) {
      if (!Array.isArray(item) || item.length !== 2 || 
          typeof item[0] !== 'number' || typeof item[1] !== 'number') {
          return false
      }
  }

  return true
}