import { createContext, useContext} from 'react'

const SpaceContext = createContext(null)

function SpaceProvider({space, ...props}) {
  return <SpaceContext.Provider value={space}>
    {props.children}
  </SpaceContext.Provider>
}

const useSpace = () => useContext(SpaceContext)

export { SpaceProvider, useSpace }