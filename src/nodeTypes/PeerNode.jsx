import { memo, useCallback } from 'react';
import { LiveVideo } from '../components/LiveVideo';
import { useAwareness, useThrottledAwareness } from "../hooks/useAwareness"

import { NodeResizer } from '@reactflow/node-resizer';
import './Resizer.css';

import { NodeToolbar, Position } from 'reactflow'


function CallStatusLabel({data}) {
  if (typeof data == 'undefined')
    console.error('[CallStatusLabel] data missing')

  return <span style={{opacity: 0.4}}>
    {data?.inCall ? '' : '(not in call)'}
  </span>
}

const PeerNodeCommon = memo(({ data, id, children }) => {
  return <>
    <div style={{height: '100%', borderRadius: '50%', ...data?.style, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <LiveVideo id={id}/>
    </div>
    <NodeToolbar isVisible={true} position={Position.Bottom} offset={0}>
      {children}
    </NodeToolbar>
  </>
})

export const RemotePeer = memo(({data, id}) => {
  return (
    <PeerNodeCommon data={data} id={id}>
      {data?.name} <CallStatusLabel data={data}/>
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

  return (
  <>
    <NodeResizer
      color={'#0f0'}
      minWidth={30}
      minHeight={30}
      onResize={onResize}
    />
    <PeerNodeCommon data={data} id={id}>
      <div onClick={updateName}>
        {data?.name} <CallStatusLabel data={data}/>
      </div>
    </PeerNodeCommon>
  </>
  )
})
