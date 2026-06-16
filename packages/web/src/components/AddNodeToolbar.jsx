import { useCallback, useRef, useState } from 'react'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { useNewNodePosition } from "../hooks/useNewNodePosition"
import { Uploader } from "./Uploader"
import { SpaceSettings } from './SpaceSettings'
import { defaultZIndex } from '../consts'

export function AddNodeToolbar() {
  const uploaderRef = useRef()
  const { addNode } = usePersistedNodeActions()
  const getNewNodePos = useNewNodePosition()

  /*
  since we use the <dialog> element, components within are mounted
  even if dialog is hidden. this at least waits until they are shown
  to mount the components.
  */
  const [mountUploader, setMountUploader] = useState(false)
  const [mountSettings, setMountSettings] = useState(false)
  
  const addPadNode = useCallback(()=>{
    addNode({
      id: `pad_${+new Date()}`,
      type: 'PadNode',
      data: {
        style: {
          background: '#FFF'
        }
      },
      z: defaultZIndex.Pad,
      position: getNewNodePos(120, 120),
      width: 120,
      height: 120,
    })
  },
  [])

  /**
   * Adds a video, image, or sound node 
   * @param {string} type - video | image | sound
   * @param {Object} data - { link: <link> } or { hls: <link> }s
   * @param {int} bulkAddIndex - grid position
   */
  const addMediaNode = useCallback((type, data, bulkAddIndex=0)=>{
    if (type!=='video'&&type!=='image'&&type!=='images'&&type!=='sound')
      return
    if (!data)
      return

    let node = {
      id: `${type}_${+new Date()}`,
      type: type,
      data,
      position: getNewNodePos(300,180),
      z: defaultZIndex.Media,
    }

    //if (type=='video'||type=='image'){
      node.width = 240
      node.height = 180
    //}

    if (bulkAddIndex > 0) {
      node.position.y += node.height * bulkAddIndex
    }

    addNode(node)
  },
  [])

  return (
    <>
      <dialog id="uploader" popover="auto" ref={uploaderRef}>
        {
          mountUploader && 
          <Uploader
            onUploaded={(type, data, bulkAddIndex)=>addMediaNode(type, data, bulkAddIndex)}
            onClose={()=>uploaderRef.current?.hidePopover()}
          />
        }
      </dialog>
      <dialog id="settings" popover="auto">
        {
          mountSettings && 
          <SpaceSettings/>
        }
      </dialog>

      <button onClick={addPadNode}>+pad</button><br/>
      <button popovertarget="uploader" onClick={()=>setMountUploader(true)}>+upload</button><br/>
      <button popovertarget="settings" onClick={()=>setMountSettings(true)}>settings</button>
    </>
  )
}