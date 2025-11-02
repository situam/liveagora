// TODO: make this common for frontend/backend

export function getAgoraDocName(agoraName: string) {
    //return `${agoraName}/index.agora`
    return `agora/${agoraName}`
}

export function getSpaceDocName(agoraName: string, spaceName: string) {
    //return `${agoraName}/${spaceName}.space`
    return `space/${agoraName}/${spaceName}`
}