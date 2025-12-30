/**
 * Document naming utils
 * Format: "agora:id" or "space:agoraId:spaceId"
 */

export function buildAgoraDoc(agoraId: string): string {
  return `agora:${agoraId}`
}

export function buildSpaceDoc(agoraId: string, spaceId: string): string {
  return `space:${agoraId}:${spaceId}`
}

export function getAgoraDocFromSpaceDoc(spaceDoc: string): string {
  const [type, rest] = spaceDoc.split(":", 2)
  const [agoraId] = rest.split(":", 2)
  return `agora:${agoraId}`
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

export function getAgoraNameFromDocName(documentName: string): string {
  const [_, name] = documentName.split('agora:', 2)
  return name
}