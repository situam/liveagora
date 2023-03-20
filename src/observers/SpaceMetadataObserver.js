import { useEffect, useCallback } from 'react'
import { useSpace } from '../context/SpaceContext'

export const SpaceMetadataObserver = () => {
  const { metadata } = useSpace()

  const sync = useCallback(() => {
    console.log('[SpaceMetadataObserver]', metadata.map.get('background')?.val);
    document.querySelector(':root').style.setProperty('--theme-background', metadata.map.get('background')?.val || '#e6e6fa')
  }, [metadata])

  useEffect(() => {
    // init
    sync()

    // register observer
    console.log("[SpaceMetadataObserver] observing")
    metadata.on('change', sync)

    // remove observer
    return () => {
      console.log("[SpaceMetadataObserver] unobserving")
      metadata.off('change', sync)
    };
  }, [metadata]);

  return null
}
