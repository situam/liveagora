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

const hocuspocusUrl = import.meta.env.VITE_HOCUSPOCUS_URL;

const AgoraLoader =({ agoraName }) => {
  const navigate = useNavigate()
  const [state, setState] = React.useState({
    isLoading: true,
    agora: null,
    spaces: [],
  })

  window.nav = navigate

  React.useEffect(() => {
    // handle disconnect if already connect
    if (state.agora?.name && agoraName != state.agora?.name) {
      console.log("AgoraLoader: disconnect from current agora")
        
      state.agora.disconnect()
      state.agora.provider.disconnect()
      if (typeof window.leaveLiveAVCall==='function') {
        window.leaveLiveAVCall()
      }
    }
    
    setState((prevState) => ({ ...prevState, isLoading: true }));

    const { baseAgora, spaces } = hatchAgora(agoraName, hocuspocusUrl, () => {
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
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>loading {agoraName}...</h1>
    </div>
  )
}
AgoraLoader.propTypes = {
  agoraName: PropTypes.string.isRequired,
}

export const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<RedirectAgoraQueryString />} />
      <Route path="/agora" element={<Navigate replace to="/agora/welcome" />} />
      <Route path="/agora/:agoraName" element={<AgoraRoute />} />
    </Routes>
  </Router>
)

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