import { useEffect, useCallback } from 'react';

import { useSpace } from "../context/SpaceContext"
import { useStoreApi } from 'reactflow'
import { NodesSnapshot } from "../snapshot/snapshot"
import { grid } from './LiveFlow';

/**
 * Return true if neither an input element nor ProseMirror is focused
 */
const _shouldOverrideDefaultBehavior = () => {
  const isInputFocused = document.activeElement instanceof HTMLInputElement ||
                         document.activeElement instanceof HTMLTextAreaElement;

  const isProseMirrorFocused = document.querySelector('.ProseMirror-focused');

  return !isInputFocused && !isProseMirrorFocused;
}

/**
 * Handles system copy/paste by saving a snapshot of the selected nodes to the clipboard,
 * and pasting a snapshot from the clipboard into the space
 * @returns {null}
 */
export const CopyPasteHandler = () => {
  const rfStore = useStoreApi()
  const space = useSpace()

  const getSelectedNodes = () => {
    let nodes = Array.from(rfStore.getState().nodeInternals.values()).filter(n=>n.selected)
    return nodes
  }
  const getSelectedNodeIds = () => getSelectedNodes().map(n=>n.id)

  const getSelectedNodesSnapshot = useCallback(()=>{
    const selectedNodeIds = getSelectedNodeIds()
    if (selectedNodeIds.length < 1)
      return null
    
    return NodesSnapshot.fromNodes(space, selectedNodeIds).toJSON()
  }, [])

  useEffect(() => {
    const handleCopy = (event) => {
      if (!_shouldOverrideDefaultBehavior())
        return

      event.preventDefault()
      if (getSelectedNodeIds().length < 1)
        return

      console.log("CopyPasteHandler: handleCopy")
      try {
        const snapshotStr = JSON.stringify(getSelectedNodesSnapshot())
        event.clipboardData.setData('text/plain', snapshotStr)
      } catch (e) {
        console.log("CopyPasteHandler: handleCopy error", e)
      }
    }

    const handlePaste = (event) => {
      if (!_shouldOverrideDefaultBehavior())
        return

      event.preventDefault()
      console.log("CopyPasteHandler: handlePaste")
      
      try {
        const pastedText = event.clipboardData.getData('text/plain')
        const parsedJSON = JSON.parse(pastedText);

        /**
         * offset the position of the pasted nodes
         */
        const offsetNodePositionFn = (n)=>({
          ...n,
          position: {
            x: n.position.x + grid[0],
            y: n.position.y + grid[1]
          }
        })

        NodesSnapshot.fromJSON(parsedJSON).loadIntoSpace(space, offsetNodePositionFn)
      } catch (e) {
        console.error("handlePaste", e)
      }
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  return null
}
