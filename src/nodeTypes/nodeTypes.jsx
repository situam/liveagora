import BaseNode from './BaseNode'
import { memo, useCallback } from 'react';
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { RemoveNodeX } from '../nodeComponents/RemoveNodeX.jsx'
import { useSpace } from '../context/SpaceContext'
import { LiveAVScreenShare } from '../components/LiveAVScreenShare'
import { NodeToolbar, Position } from 'reactflow'
import { Pad } from '../components/Pad'

const DemoNode = memo(({ data, id, selected}) => {
  const { updateNodeData } = usePersistedNodeActions()

  return (<>
    <BaseNode data={data} id={id} selected={selected}>
      <span onClick={()=>updateNodeData(id, {label: prompt('label', data.label)})}>{data.label}</span>
      <RemoveNodeX id={id}/>
    </BaseNode>
  </>)
})

const PadNode = memo(({ data, id, selected}) => {
  return (
    <BaseNode data={data} id={id} selected={selected}>
      <div style={{height: '100%', overflow: 'auto', borderRadius: '0.5em', background: '#ff0', ...data?.style}} className={`nowheel ${selected ? 'nopan nodrag' : ''}`}>
        <Pad id={id}/>
      </div>
    </BaseNode>
  )
})

const SubspaceNode = memo(({ data, id, selected}) => {
  return (
    <BaseNode data={data} id={id} selected={selected}>   
      <div style={{height: '15px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000'}}>
        {data?.label}
      </div>
      <div style={{height: 'calc(100% - 15px)', border: '2px solid black', borderRadius: '5px'}}>

      </div>
    </BaseNode>
  )
})

const StageNode = memo(({ data, id, selected}) => {
  return (
    <BaseNode data={data} id={id} selected={selected}>   
      <div style={{height: '100%', border: '2px dashed black', borderRadius: '50%', boxSizing: 'border-box'}}>

      </div>
    </BaseNode>
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
  PadNode,
  DemoNode,
  NodeHatcher,
  SubspaceNode,
  StageNode,
  ScreenShareNode,
}
