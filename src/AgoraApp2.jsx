import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { hatchAgora } from './agoraHatcher';
import { AgoraViewWithAccessControl } from './components/AgoraView'
import { PasswordGate } from './components/PasswordGate';
import { isCommunityVersion } from './AgoraApp';
import { AgoraAppLocalSnapshot } from './AgoraAppSnapshotView';

const hocuspocusUrl = import.meta.env.VITE_HOCUSPOCUS_URL;

const AgoraLoader =({ agoraName }) => {
  const navigate = useNavigate()
  const [state, setState] = React.useState({
    isLoading: true,
    agora: null,
    spaces: [],
  })

  document.title = "live agora: " + agoraName
  window.nav = navigate

  const agoraNameRef = React.useRef(agoraName);

  React.useEffect(() => {
    console.log("AgoraLoader: loading", agoraName)
    agoraNameRef.current = agoraName

    // handle disconnect if already connect
    if (state.agora?.name && agoraName != state.agora?.name) {
      console.log("AgoraLoader: first disconnect from", state.agora?.name)
      state.agora.disconnect()
      state.agora.provider.disconnect()
      if (typeof window.leaveLiveAVCall==='function') {
        window.leaveLiveAVCall()
      }
    }
    
    setState((prevState) => ({ ...prevState, isLoading: true }));

    const { baseAgora, spaces } = hatchAgora(agoraName, hocuspocusUrl, (id) => {
      if (id != agoraNameRef.current) {
        // only initial sync
        return
      }
      console.log("onSynced", id)
      setState({
        isLoading: false,
        agora: baseAgora,
        spaces: spaces,
      })
    })
  }, [agoraName, navigate])

  const { isLoading, agora, spaces } = state

  return (
    !isLoading
    ? agora?.metadata.get('passwordEnabled') ? (
        <PasswordGate>
          <AgoraViewWithAccessControl key={agora.name} agora={agora} spaces={spaces} />
        </PasswordGate>
      ) : (
        <AgoraViewWithAccessControl key={agora.name} agora={agora} spaces={spaces} />
      )
    :
    <div style={{padding: '1rem', height: '100vh', color: 'var(--ux-color-main)', background: 'var(--theme-background)'}}>
      <h1>live agora: loading {agoraName}...</h1>
    </div>
  )
}
AgoraLoader.propTypes = {
  agoraName: PropTypes.string.isRequired,
}

export const App = () => {
  // first check if ?snapshot_url is provided
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('snapshot_url')) {
    // if so, load into a local-only flow
    return <AgoraAppLocalSnapshot url={urlParams.get('snapshot_url')}/>
  }

  return <Router>
    <Routes>
    {
      isCommunityVersion ?
    <>
      <Route path="/" element={<CommunityVersionLandingPage/>} />
      <Route path="/agora" element={<CommunityVersionLandingPage/>} />
    </>
      :
    <>
      <Route path="/" element={<RedirectAgoraQueryString />} />
      <Route path="/agora" element={<Navigate replace to="/agora/welcome" />} />
    </>
    }
      <Route path="/agora/:agoraName" element={<AgoraRoute />} />
    </Routes>
  </Router>
}

const AgoraRoute = () => {
  const { agoraName } = useParams()
  return <AgoraLoader agoraName={agoraName} />
}

/**
 * Backwards compatability: /?agora=agoraName
 * Redirects to /agora/agoraName
 */
const RedirectAgoraQueryString = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const agoraName = searchParams.get('agora')
    if (agoraName) {
      navigate(`/agora/${agoraName}`, { replace: true })
    }
  }, [navigate])

  return null
}

const CommunityVersionLandingPage = () => {
  return <div style={{background: 'var(--theme-alpha-color)', position: 'fixed', top: 0, left: 0, zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <form style={{width: '20em', maxWidth: '90vw' }}>
      
        open.taat.live/agora is a pilot community version of the live&nbsp;agora by <a href="https://taat.live" target='_blank' rel='noreferrer'>taat</a>.
        we are currently testing it with a small group. if you want to be part of this, or have any questions or comments, reach out to <a href="mailto:martin@taat.live">martin@taat.live</a>
      
    </form>
  </div>
}