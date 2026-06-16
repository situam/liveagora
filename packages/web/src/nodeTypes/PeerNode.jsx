import { memo, useCallback } from 'react';
import { LiveVideo } from '../components/LiveVideo';
import { useAwareness, useThrottledAwareness } from "../hooks/useAwareness"

import { NodeResizer } from '@reactflow/node-resizer';
import './Resizer.css';

import { NodeToolbar, Position } from 'reactflow'
import { generateRandomColor } from '../util/utils';
import { LiveAVToolbarOrchestrator } from '../components/LocalOrchestrator';
import { LiveAVScreenShare, LiveAVScreenShareStopButton } from '../components/LiveAVScreenShare';
import { useAgora } from '../context/AgoraContext';

const _labelStyle = {fontSize:'0.7em'};

function CallStatusLabel({data}) {
  if (typeof data == 'undefined')
    console.error('[CallStatusLabel] data missing')

  return <span style={{opacity: 0.4}}>
    {data.callStatus ?? '(not in call)'}
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
      <div style={_labelStyle}>{data?.name} <CallStatusLabel data={data}/></div>
    </PeerNodeCommon>
  )
})

const _CommonScreenshare = memo(({data, id}) => {
  return <>
    <LiveAVScreenShare data={data}/>
    <NodeToolbar isVisible={true} position={Position.Bottom} offset={0}>
      <div style={_labelStyle}>{data?.label}</div>
    </NodeToolbar>
  </>
})

export const RemotePeerScreenshare = memo(({data, id}) => {
  return <_CommonScreenshare data={data} id={id} />
})

export const LocalPeerScreenshare = memo(({data, id, selected}) => {
  const awareness = useAwareness()
  const throttledAwareness = useThrottledAwareness()

  const onResize = useCallback((_, params)=>{
    throttledAwareness.setLocalState({
      ...awareness.getLocalState(),
      screenshare: {
        ...awareness.getLocalState().screenshare,
        position: { x: params.x, y: params.y },
        width: params.width,
        height: params.height
      }
    })
  }, [awareness])

  return (
  <>
    <_CommonScreenshare data={data} id={id} />
    <NodeResizer
      color={'var(--ux-color-secondary)'}
      minWidth={30}
      minHeight={30}
      onResize={onResize}
    />
    <NodeToolbar isVisible={true} position={Position.Bottom} offset={15} style={_labelStyle}>
      <LiveAVScreenShareStopButton />
    </NodeToolbar>
  </>
  )
})


export const LocalPeer = memo(({data, id}) => {
  const agora = useAgora()
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
    
    agora.presence.setName(name)
  }, [agora, data])

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
      <div onClick={updateName} style={_labelStyle}>
        {data?.name} <CallStatusLabel data={data}/>
      </div>
    </PeerNodeCommon>
    <NodeToolbar isVisible={true} position={Position.Right} offset={5}>
      <LiveAVToolbarOrchestrator/>
    </NodeToolbar>
    <NodeResizer
      color={'var(--ux-color-secondary)'}
      minWidth={30}
      minHeight={30}
      onResize={onResize}
    />
  </>
  )
})
