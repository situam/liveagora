import { AgoraView } from "./components/AgoraView"
import { PasswordGate } from "./components/PasswordGate";

const urlParams = new URLSearchParams(window.location.search);
export const backstageEnabled = urlParams.has('backstage')
const base = urlParams.get('agora')

function init(base, hocuspocusurl) {
  const baseAgora = new agoraHatcher.Agora(base, hocuspocusurl)
  
  const validSpaces = ['space00', 'space01', 'space02', 'space03', 'space04', 'space05']
  const spaceCount = 6
  
  const spaces = validSpaces.slice(0, spaceCount).map(space=>new agoraHatcher.Space(space, baseAgora)) 

  return {
    baseAgora,
    spaces
  }
}

if (base) {
  const { baseAgora, spaces } = init(base, 'wss://hocuspocus.taat.live')

  ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
    <PasswordGate>
      <AgoraView agora={baseAgora} spaces={spaces}/>
    </PasswordGate>
    // </React.StrictMode>
  )
} else {
  document.getElementById('root').innerHTML = `
  <div style="height: 100%; display: flex; align-items: center; justify-content: center; ">
    link is invalid!
  </div>
  `
}

