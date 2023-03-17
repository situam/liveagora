import { useCallback, useState } from 'react'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { useNewNodePosition } from "../hooks/useNewNodePosition"
import { Uploader } from "./Uploader"

export function AddNodeToolbar() {
  const [ uploaderVisible, setUploaderVisible ] = useState(false)
  const { addNode } = usePersistedNodeActions()
  const getNewNodePos = useNewNodePosition()
  
  const addPadNode = useCallback(()=>{
    addNode({
      id: `pad_${+new Date()}`,
      type: 'PadNode',
      data: {
        style: {
          background: '#EFEFEF'
        }
      },
      z: 100,
      position: getNewNodePos(120, 120),
      width: 120,
      height: 120,
    })
  },
  [])

  const addMediaNode = useCallback((link, type)=>{
    if (!link)
      return
    if (type!=='video'&&type!=='image'&&type!=='sound')
      return

    addNode({
      id: `${type}_${+new Date()}`,
      type: type,
      data: {
        link: link
      },
      position: getNewNodePos(300,200),
      z: 500,
      width: 240,
      height: 180
    })
  },
  [])

  return (
    <>
    {
      uploaderVisible && 
      <div onClick={()=>setUploaderVisible(false)} style={{background: 'var(--theme-alpha-color)', position: 'fixed', top: 0, left: 0, zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Uploader
          isVisible={uploaderVisible}
          onUploaded={(url, type)=>addMediaNode(url, type)}
          onClose={()=>setUploaderVisible(false)}
        />
      </div>
    }
      <button onClick={addPadNode}>+pad</button><br/>
      <button onClick={()=>setUploaderVisible(true)}>+image/video</button>
    </>
  )
}