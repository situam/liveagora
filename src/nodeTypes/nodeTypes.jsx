import { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { RemoveNodeX } from '../nodeComponents/RemoveNodeX.jsx'
import { useSpace } from '../context/SpaceContext'
import { LiveAVScreenShare } from '../components/LiveAVScreenShare'
import { NodeToolbar, Position } from 'reactflow'

import Hls from 'hls.js';
import { BaseNode } from './BaseNode'
import { AgoraNode } from './AgoraNode'
import { PadNode } from './PadNode'

import { NodeMetadataLabel } from '../components/NodeMetadataLabel.jsx';

const DemoNode = memo(({ data, id, selected}) => {
  const { updateNodeData } = usePersistedNodeActions()

  return (
    <BaseNode data={data} id={id} selected={selected}>
      <span onClick={()=>updateNodeData(id, {label: prompt('label', data.label)})}>{data.label}</span>
      <RemoveNodeX id={id}/>
    </BaseNode>
  )
})
 
const ImageNode = memo(({data, id, type, selected}) => {
  return (
    <>
      <BaseNode data={data} id={id} type={type} selected={selected}>
        <img src={data?.link} className="cover-img"></img>
      </BaseNode>
      <NodeMetadataLabel data={data} id={id}/>
    </>
  )
})

const VideoNode = memo(({id, data, type, selected}) => {
  //const controlsVisible = true
  const controlsVisible = useMemo(() => {
    if (!('controls' in data))
      return true

    return data.controls
  }, [data])

  // const toggleControls = useCallback(()=>{
  //   const oldNode = nodeStore.get(id)
  //   nodeStore.set(id, {
  //     ...oldNode,
  //     data: {
  //       ...oldNode.data,
  //       controls: !controlsVisible
  //     }
  //   })
  // }, [nodeStore, data])
  const videoRef = useRef(null);
  useEffect(()=>{
    if (videoRef.current && data.hasOwnProperty('hls')) {
      const browserHasNativeHLSSupport = videoRef.current.canPlayType('application/vnd.apple.mpegurl')
      
      if (browserHasNativeHLSSupport) {
        videoRef.current.src = data.hls
      } else if (Hls.isSupported()) {
        let hls = new Hls()
        hls.loadSource(data.hls)
        hls.attachMedia(videoRef.current)
        console.log('Available quality levels in current stream', hls.levels);
      }
    }
  }, [data]);
  
  return <>
    <BaseNode data={data} id={id} selected={selected} type={type}>
      <video
        ref={videoRef}
        className="cover-video"
        src={data?.link}
        autoPlay={true}
        loop={true}
        muted
        controls={controlsVisible}
      />
    </BaseNode>
    <NodeMetadataLabel data={data} id={id}/>
  </>
})

const SoundNode = memo(({id, data, selected}) => {
  return <>
    <BaseNode data={data} id={id} selected={selected}>
      <div style={{ padding: '15px' }}>
        <audio controls>
          <source src={data.link} type="audio/mpeg" />
          Your browser does not support audio element.
        </audio>
      </div>
      {data?.label && data.label}
    </BaseNode>
    <NodeMetadataLabel data={data} id={id}/>
  </>
})

const SubspaceNode = memo(({ data, id, type, selected}) => {
  return (
    // <BaseNode data={data} id={id} type={type} selected={selected}>   
      <div style={{height: '100%'}}>
        <div style={{height: '15px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000'}}>
          {data?.label}
        </div>
        <div style={{height: 'calc(100% - 15px)', border: '2px solid black', boxSizing: 'border-box', borderRadius: '5px', ...data?.style}}>

        </div>
      </div>
    // </BaseNode>
  )
})

const BoundaryNode = memo(({ data }) => {
  const radius = 0.5;
  const _patternId = 'bg';  

  return (
    <div style={{
      height: '100%',
      boxSizing: 'border-box',
      background: 'var(--theme-background)'
    }}>
      
      <svg width='100%' height='100%'>
        <pattern
          id={_patternId}
          x={0}
          y={0}
          width={15}
          height={15}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={radius} cy={radius} r={radius} fill='#00ff00'/>
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${_patternId})`} />
      </svg>
      
    </div>
  )
}) 

const StageNode = memo(({ data, id, selected}) => {
  return (
    //<BaseNode data={data} id={id} selected={selected}>   
      <div style={{height: '100%', border: `${data?.subspace=='stage-innercircle' ? 2 : 1}px dashed black`, borderRadius: '50%', boxSizing: 'border-box'}}>
      </div>
    //</BaseNode>
  )
})

const ScreenShareNode = memo(({data, id, selected}) => {
  return (
    <BaseNode data={data} id={id} selected={selected}>   
      <LiveAVScreenShare data={data}/>
      <NodeToolbar isVisible={true} position={Position.Bottom} offset={0}>
        {data?.label}
      </NodeToolbar>
    </BaseNode>   
  )
})

const NodeHatcher = memo(({ data, id, selected }) => {
  const { addNode, getNode } = usePersistedNodeActions()
  const space = useSpace()

  const makeNewDemoNode = useCallback(()=>{
    const label = prompt("Enter text:")

    if (!label)
      return 

    const me = getNode(id)
    const newId = `${Math.floor(Math.random()*1000)}`
    let newNode = {
      id: newId,
      type: 'DemoNode',
      data: { label: label },
      position: {
        x: me.position.x,
        y: me.position.y + me.height + 15
      },
      width: 60,
      height: 60,
    }
    
    addNode(newNode)
  }, [addNode])

  return (
    <BaseNode id={id} selected={selected} resizerVisible={selected}>
      <button onClick={makeNewDemoNode}>+text</button>
      <RemoveNodeX id={id}/>  
    </BaseNode>
  )
})

export {
  ImageNode,
  VideoNode,
  SoundNode,
  PadNode,
  DemoNode,
  NodeHatcher,
  AgoraNode,
  SubspaceNode,
  StageNode,
  ScreenShareNode,
  BoundaryNode
}
