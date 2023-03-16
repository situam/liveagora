import { useRef, useState, useEffect, useCallback, memo } from 'react'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'
import { useAwareness } from '../hooks/useAwareness'
import { useLiveMetadata } from '../hooks/useLiveMetadata'
import { useEnterLiveAVSpace } from './LiveAV'

export function useLiveAwarenessSpace() {
  const awareness = useAwareness()
  const [state, setState] = useState(null)

  const syncState = useCallback(()=>{
    setState(awareness.getLocalState()?.space || null)
    // if (awareness.getLocalState()?.space != state?.space) {
    //   console.log("[liveAwarenessSpace]", awareness.getLocalState()?.space)
    //   setState(awareness.getLocalState()?.space || null)
    // }
  }, [setState])

  useEffect(() => {
    syncState()
    awareness.on('change', syncState)

    return ()=>awareness.off('change', syncState)
  }, [])

  return state
}

function useAwarenessCount() {
  const [awarenessCount, setAwarenessCount] = useState(null)
  const awareness = useAwareness()
  const space = useSpace()

  const syncAwarenessCount = useCallback(()=>{
    let count = Array.from(awareness.getStates().values()).filter(state=>state.space==space.name).length
    setAwarenessCount(count)
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

  const liveMetadata = useLiveMetadata()
  const liveAwarenessSpace = useLiveAwarenessSpace()

  //const enterLiveAVSpace = useEnterLiveAVSpace()
  //const [entered, setEntered] = useState(false)
  const inputRef = useRef()
  const [inputValues, setInputValues] = useState({ name: "" })

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }))
  }

  useEffect(() => {
    if (inputRef?.current)
      inputRef.current.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    let count = Array.from(awareness.getStates().values()).filter(state=>state.space==space.name).length
    if (count > 99) {
      alert('Sorry, this space has reached capacity.')
      return 
    }

    if (inputRef.current)
      agora.setName(inputRef.current.value)

    space.connect()
    //enterLiveAVSpace()
  };

  if (liveAwarenessSpace == space.name)
    return children

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <form onSubmit={handleSubmit}>
        { !agora.getName() && <input
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
          liveAwarenessSpace != null ?
            <button>leave {liveAwarenessSpace} and enter {liveMetadata?.spaceDisplayName?.val || space.name}</button>
          :
            <button>enter {liveMetadata?.spaceDisplayName?.val || space.name}</button>
        }
        <AwarenessCounter/>
      </form>
    </div>
  )
}