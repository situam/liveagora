import { memo, useCallback } from 'react';
import { LiveVideo } from '../components/LiveVideo';
import { useAwareness, useThrottledAwareness } from "../hooks/useAwareness"

import { NodeResizer } from '@reactflow/node-resizer';
import './Resizer.css';

import { NodeToolbar, Position } from 'reactflow'
import { generateRandomColor } from '../util/utils';


function CallStatusLabel({data}) {
  if (typeof data == 'undefined')
    console.error('[CallStatusLabel] data missing')

  return <span style={{opacity: 0.4}}>
    {data?.callStatus != null ? data.callStatus : '(not in call)'}
  </span>
}

const PeerNodeCommon = memo(({ data, id, onClick, children }) => {
  return <>
    <div onClick={onClick} style={{height: '100%', ...data?.style, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <LiveVideo id={id} borderRadius={data?.style?.borderRadius}/>
    </div>
    <NodeToolbar isVisible={true} position={Position.Bottom} offset={0}>
      {children}
    </NodeToolbar>
  </>
})

export const RemotePeer = memo(({data, id}) => {
  return (
    <PeerNodeCommon data={data} id={id}>
      <div style={{fontSize:'0.7em'}}>{data?.name} <CallStatusLabel data={data}/></div>
    </PeerNodeCommon>
  )
})

export const LocalPeer = memo(({data, id}) => {
  const awareness = useAwareness()
  const throttledAwareness = useThrottledAwareness()

  const onResize = useCallback((_, params)=>{
    throttledAwareness.setLocalState({
      ...awareness.getLocalState(),
      position: { x: params.x, y: params.y },
      width: params.width,
      height: params.height
    })
  }, [awareness])

  const updateName = useCallback(()=>{
    let name = prompt("enter name: ", data?.name)
    if (!name)
      return
    
    awareness.setLocalStateField('data', {
      ...awareness.getLocalState()?.data,
      name
    })
  }, [awareness, data])

  const updateColor = useCallback(()=>{
    let style = { ...data?.style }
    style.background = generateRandomColor()

    awareness.setLocalStateField('data', {
      ...data,
      style
    })
  }, [awareness, data])

  return (
  <>
    <PeerNodeCommon onClick={updateColor} data={data} id={id}>
      <div onClick={updateName} style={{fontSize:'0.7em'}}>
        {data?.name} <CallStatusLabel data={data}/>
      </div>
    </PeerNodeCommon>
    <NodeResizer
      color={'var(--ux-color-secondary)'}
      minWidth={30}
      minHeight={30}
      onResize={onResize}
    />
  </>
  )
})
