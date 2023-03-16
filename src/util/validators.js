export const isValidNode = (node) => {
  // @todo check has position, etc..
  return node?.id && (typeof node?.id === 'string') || false
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