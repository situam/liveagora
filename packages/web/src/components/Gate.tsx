import { useRef, useState, useEffect, useCallback, memo } from 'react'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'
import { useAwareness } from '../hooks/useAwareness'
import { useSpaceAccessControl } from '../context/AccessControlContext'

export function useLiveAwarenessSpace() {
  const awareness = useAwareness()
  const getLiveAwarenessSpace = () => awareness.getLocalState()?.space ?? null

  const [state, setState] = useState(getLiveAwarenessSpace)

  useEffect(() => {
    const syncState = () => setState(getLiveAwarenessSpace())

    awareness.on('change', syncState)

    return ()=>awareness.off('change', syncState)
  }, [])

  return state
}

function useAwarenessCount() {
  const [awarenessCount, setAwarenessCount] = useState(0)
  const awareness = useAwareness()
  const agora = useAgora()
  const space = useSpace()

  const syncAwarenessCount = useCallback(()=>{
    setAwarenessCount(agora.presence.getCountInSpace(space!.name))
  }, [setAwarenessCount])

  useEffect(() => {
    syncAwarenessCount()
    awareness.on('change', syncAwarenessCount)

    return ()=>awareness.off('change', syncAwarenessCount)
  }, [])

  return awarenessCount
}

const AwarenessCounter = memo(()=>{
  const count = useAwarenessCount()

  if (count == 1)
    return <> (with 1 other)</>

  if (count > 1)
    return <> (with {count} others)</>
})

export function Gate({children}) {
  const agora = useAgora()
  const space = useSpace()
  const awareness = useAwareness()

  const { setAuthScope, setCurrentRole } = useSpaceAccessControl()
  const liveAwarenessSpace = useLiveAwarenessSpace()

  const spaceDisplayName = space.displayName //liveMetadata?.spaceDisplayName?.val || space.name

  const alreadyPresentInThisSpace = liveAwarenessSpace === space.name

  const inputRef = useRef()
  const [inputValues, setInputValues] = useState({
    name: "",
    token: null,
  })
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }))
  }

  useEffect(() => {
    if (inputRef?.current)
      inputRef.current.focus()

    if (space?.enableArchiveView || alreadyPresentInThisSpace) {
      // autoconnect
      connect()
    }
  }, [])

  const connect = async () => {
    try {
      if (!alreadyPresentInThisSpace) {
        await space.connect(inputValues.token, (accessRole) => {
          setAuthScope(accessRole)
          setCurrentRole(accessRole)
        })
      }

      // wait for synced so that space elements are loaded before showing SpaceFlow
      await space.syncProvider.synced
      setLoaded(true)
    } catch (e) {
      setShowPasswordField(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (agora.presence.getCountInSpace(space.name) > 99) {
      alert('Sorry, this space has reached capacity.')
      return 
    }

    if (inputRef.current)
      agora.presence.setName(inputRef.current.value)

    connect()
  };

  if (space?.enableArchiveView) {
    if (loaded) {
      return children
    } else {
      return <>loading...</>
    }
  }

  if (loaded && alreadyPresentInThisSpace)
    return children

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column'}}>
      <div style={{margin:'15px', marginBottom: '45px'}}>
        Welcome to the Live Agora, a playful space for exchange and sharing.
      </div>
      <form onSubmit={handleSubmit}>
        { !agora.presence.getName() && <input
          required
          value={inputValues.name}
          onChange={handleInputChange}
          id="name"
          type="text"
          name="name"
          placeholder={'your name'}
          ref={inputRef}
        />}
        {
          showPasswordField &&
          <div className="input-container">
            <label>
              <p style={{ marginBottom: '5px' }}>Enter password to continue:</p>
              <input
                required
                value={inputValues.token ?? ''}
                onChange={handleInputChange}
                id="token"
                type="password"
                name="token"
                placeholder={'password'}
              />
            </label>
          </div>
        }
        {
          liveAwarenessSpace != null ?
            <button>leave {agora.metadata.get(`${liveAwarenessSpace}-displayName`) || liveAwarenessSpace} and enter {spaceDisplayName}</button>
          :
            <button>enter {agora.name}{
              agora.enabledSpaces.length > 1
                ? ':' + spaceDisplayName
                : ''
            }</button>
        }
        <AwarenessCounter/>
      </form>
    </div>
  )
}