import { useRef, useState, useEffect } from 'react'
import { useAgora } from '../context/AgoraContext'
import { useSpace } from '../context/SpaceContext'
import { useAwareness } from '../hooks/useAwareness'
import { useEnterLiveAVSpace } from './LiveAV'

export function Gate({children}) {
  const agora = useAgora()
  const space = useSpace()
  const awareness = useAwareness()

  const enterLiveAVSpace = useEnterLiveAVSpace()

  const [statusMsg, setStatusMsg] = useState(null)
  const [entered, setEntered] = useState(false)
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

    if (inputRef.current)
      agora.setName(inputRef.current.value)

    space.connect()

    setEntered(true)
    enterLiveAVSpace()
    /*setStatusMsg('connecting...')
    try {
      await enterLiveAVSpace()
      
      setEntered(true)
    } catch (e) {
      setStatusMsg(e.message)
    }*/
  };

  if (entered || ( awareness.getLocalState().space == space.name) )
    return children

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <form onSubmit={handleSubmit}>
        { !agora.getName() &&
          <input
            required
            value={inputValues.name}
            onChange={handleInputChange}
            id="name"
            type="text"
            name="name"
            placeholder={'your name'}
            ref={inputRef}
          />
        }
        {
          awareness.getLocalState().space ?
            <button>leave {awareness.getLocalState().space} and enter {space.name}</button>
          :
            <button>enter {space.name}</button>
        }
        {
          statusMsg && <pre>{statusMsg}</pre>
        }
      </form>
    </div>
  )
}