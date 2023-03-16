import { useSpace } from "../context/SpaceContext"

export const useAwareness = () => {
  const space = useSpace()

  return space.awareness
}
