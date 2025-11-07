import { useSpace } from "../context/SpaceContext"

export const useAwareness = () => {
  const space = useSpace()

  return space.awareness
}

export const useThrottledAwareness = () => {
  const space = useSpace()

  return { 
    setLocalState: space.updateAwarenessThrottled
  }
}