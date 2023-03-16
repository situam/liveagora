import { useSpace } from '../context/SpaceContext'

export const usePersistedNodeActions = () => {
  const space = useSpace()
  
  return space.nodeActions
}