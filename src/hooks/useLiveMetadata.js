import { useSpace } from "../context/SpaceContext"
import { useState, useEffect } from "react"
import { useYkvEntry } from "./useYkv"
import { isValidCoordinateExtent } from "../util/validators"

export function useLiveMetadata() {
  const [state, setState] = useState({})
  const { metadata } = useSpace()

  useEffect(()=>{
    const syncState = () => {
      setState(Object.fromEntries(metadata.map.entries()))
    }

    //init
    syncState()
    
    //start observing
    metadata.on('change', syncState)

    //stop obsering
    return ()=>metadata.off('change', syncState)
  }, [metadata])

  return state
}

/**
 * Retrieves a live metadata entry from the space's metadata.
 * @param {string} entryKey - The key of the metadata entry to retrieve.
 * @param {*} [defaultValue=undefined] - The default value to return if the entry is not found.
 * @param {function(*): boolean} [validateFn=undefined] - A function to validate the retrieved entry value.
 * @returns {*} The value of the metadata entry, or the default value if not found or validation fails.
 */
export function useLiveMetadataEntry(entryKey, defaultValue = undefined, validateFn = undefined) {
  const { metadata } = useSpace()
  const entryValue = useYkvEntry(metadata, entryKey)

  if (typeof entryValue === 'undefined')
    return defaultValue
  if (typeof validateFn != 'undefined' && !validateFn(entryValue)) {
    console.error(`invalid value for ${entryKey}:`, entryValue)
    return defaultValue
  }

  return entryValue
}

/**
 * Retrieves the coordinate extent of the space's canvas bounds.
 * @returns {CoordinateExtent} The coordinate extent of the canvas bounds.
 */
export function useSpaceCanvasBounds() {
  const defaultValue = [[-4500, -4500], [4500, 4500]]
  return useLiveMetadataEntry('canvasBounds', defaultValue, isValidCoordinateExtent)
}

/**
 * @returns {boolean} background blend enabled
 */
export function useSpaceBackgroundBlend() {
  const defaultValue = false
  return useLiveMetadataEntry('backgroundBlend', defaultValue, (value) => typeof value === 'boolean')
}

/**
 * @returns {string} background color
 */
export function useSpaceBackground() {
  const defaultValue = '#e6e6fa'
  return useLiveMetadataEntry('background', defaultValue, (value) => typeof value === 'string')
}

/**
 * @returns {boolean} background grid enabled
 */
export function useSpaceBackgroundGrid() {
  const defaultValue = true
  return useLiveMetadataEntry('backgroundGrid', defaultValue, (value) => typeof value === 'boolean')
}

/**
 * @returns {boolean} branding enabled
 */
export function useSpaceBranding() {
  const defaultValue = true
  return useLiveMetadataEntry('showBranding', defaultValue, (value) => typeof value === 'boolean')
}

/**
 * @returns {boolean} zoom buttons enabled
 */
export function useSpaceShowZoomControls() {
  const defaultValue = false
  return useLiveMetadataEntry('showZoomControls', defaultValue, (value) => typeof value === 'boolean')
}