import { AgoraView } from "./components/AgoraView"
import agoraHatcher from "./agoraHatcher";
import { PasswordGate } from "./components/PasswordGate";

const hocuspocusurl = 'wss://hocuspocus.taat.live' //'ws://localhost:3000'

const validSpaces = ['space00', 'space01', 'space02', 'space03', 'space04', 'space05']
const urlParams = new URLSearchParams(window.location.search);

const base = urlParams.get('agora')

const baseAgora = new agoraHatcher.Agora(base, hocuspocusurl)
//const spaceCount = !urlParams.has('spaces') ? 1 : Math.min(Math.max(1, parseInt(urlParams.get('spaces'))), validSpaces.length)
const spaceCount = 6

const spaces = validSpaces.slice(0, spaceCount).map(space=>new agoraHatcher.Space(space, baseAgora)) 

export const backstageEnabled = urlParams.has('backstage')
//const spaces = validSpaces
  //.filter(space=>urlParams.has(space))
  //.map(space=>new agoraHatcher.Space(space, baseAgora)) 

export default function AgoraApp() {
  if (spaces.length < 1 || !base)
    return (<p>Invalid url</p>)
  
  return (
    //<PasswordGate>
      <AgoraView agora={baseAgora} spaces={spaces}/>
    //</PasswordGate>
  )
}