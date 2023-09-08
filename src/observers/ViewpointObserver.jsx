import { useCallback } from 'react';
import { useOnViewportChange, useReactFlow } from 'reactflow';
import throttle from 'lodash.throttle'
import { useAwareness } from "../hooks/useAwareness"



function onViewportChanged(viewport, updateFn) {
  /*
    updateFn is only called if window.agoraBroadcastViewport is set
    TODO set this
  */
  if (window.agoraBroadcastViewport)
    updateFn(viewport)
}

const throttleMs = 100
const onViewportChangedThrottled = throttle(onViewportChanged, throttleMs)

export const ViewpointChangeLogger = () => {
  const awareness = useAwareness()
  const { setViewport, viewportInitialized } = useReactFlow();

  const updateAwarenessWithViewport = useCallback((vp)=>awareness.setLocalStateField('viewport', vp), [awareness]);

  useOnViewportChange({
    onStart: useCallback((viewport)=>onViewportChangedThrottled(viewport, updateAwarenessWithViewport), []),
    onChange: useCallback((viewport)=>onViewportChangedThrottled(viewport, updateAwarenessWithViewport), []),
    onEnd: useCallback((viewport)=>onViewportChangedThrottled(viewport, updateAwarenessWithViewport), []),
  });

  window.setVp = (vp) => {
    setViewport(vp, {duration: 90})
    console.log("[setVp]", vp)
  }

  useCallback(()=>console.log("vp init", viewportInitialized), [viewportInitialized])

  return null
}