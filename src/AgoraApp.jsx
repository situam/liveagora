import { AgoraView } from "./components/AgoraView"
import agoraHatcher from "./agoraHatcher";

const hocuspocusurl = 'wss://hocuspocus.taat.live' //'ws://localhost:3000'

const validSpaces = ['space00', 'space01', 'space02', 'space03', 'space04', 'space05']
const urlParams = new URLSearchParams(window.location.search);

const baseAgora = new agoraHatcher.Agora(urlParams.get('base'), hocuspocusurl)
const spaceCount = Math.min(Math.max(1, parseInt(urlParams.get('spaces'))), validSpaces.length)

const spaces = validSpaces.slice(0, spaceCount).map(space=>new agoraHatcher.Space(space, baseAgora)) 

//const spaces = validSpaces
  //.filter(space=>urlParams.has(space))
  //.map(space=>new agoraHatcher.Space(space, baseAgora)) 

export default function AgoraApp() {
  if (spaces.length < 1)
    return (<p>Invalid url. Should take shape as /?base=&spaces=3</p>)
  
  return <AgoraView agora={baseAgora} spaces={spaces}/>
}