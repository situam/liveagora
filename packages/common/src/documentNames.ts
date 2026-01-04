/**
 * Document naming utils
 * Format: "agora:agoraId" or "space:agoraId:spaceId"
 */

export function buildAgoraDoc(agoraId: string): string {
  return `agora:${agoraId}`
}

export function buildSpaceDoc(agoraId: string, spaceId: string): string {
  return `space:${agoraId}:${spaceId}`
}

export function buildSpaceDocPrefix(agoraId: string): string {
  return `space:${agoraId}:`
}

export function parseDocType(documentName: string): "agora" | "space" {
  const [type, _] = documentName.split(':', 2)
  
  if (type !== "agora" && type !== "space") {
    throw new Error(`parseDocType: unhandled document type ${type}`)
  }

  return type
}

export function parseDocTypeSafe(documentName: string): "agora" | "space" | null {
  try {
    return parseDocType(documentName)
  } catch {
    return null
  }
}

export function parseAgoraIdFromDocName(documentName: string): string {
  const [type, agoraId, _] = documentName.split(':')
  return agoraId
}

export function parseSpaceIdFromDocName(documentName: string): string {
  const [_, agoraId, spaceId] = documentName.split(':')
  return spaceId
}