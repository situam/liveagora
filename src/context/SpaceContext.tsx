import { createContext, useContext} from 'react'
import { Space } from '../agoraHatcher'

const SpaceContext = createContext<Space|null>(null)

function SpaceProvider({space, ...props}: {space: Space, children: React.ReactNode}) {
  return <SpaceContext.Provider value={space}>
    {props.children}
  </SpaceContext.Provider>
}

const useSpace = () => useContext(SpaceContext)

export { SpaceProvider, useSpace }