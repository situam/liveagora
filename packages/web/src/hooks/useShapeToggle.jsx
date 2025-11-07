import { useAwareness } from "./useAwareness"
import { useCallback } from 'react'
const isRound = (state) => !!(state?.data?.style?.borderRadius == '50%')

export function useShapeToggle() {
  const awareness = useAwareness()

  const toggleShape = useCallback(() => {
    if (!awareness.getLocalState())
      return

    let style = { ...awareness.getLocalState()?.data?.style }

    if (isRound(awareness.getLocalState()))
      delete style.borderRadius
    else
      style.borderRadius = '50%'

    awareness.setLocalStateField('data', {
      ...awareness.getLocalState().data,
      style
    })
  }, [awareness])

  return toggleShape
}