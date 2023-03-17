import { NodeResizer } from '@reactflow/node-resizer';
import './Resizer.css';

import { useNodeResizeHandler } from '../hooks/useNodeResizeHandler';
import { SharedNodeToolbar } from '../nodeComponents/SharedNodeToolbar';

import { memo } from "react"
import isEqual from 'react-fast-compare'

function NodeSelectedIndicator() {
  return <div style={{ zIndex: -1000, position: 'absolute', top: '-7px', left: '-7px', width: 'calc(100% + 14px)', height:'calc(100% + 14px)', borderRadius: 5, background: 'rgba(255,255,255,0.3)'}}>
  </div>
}

const BaseNode = memo(({ id, selected, data, type, children }) => {
  const handleNodeResize = useNodeResizeHandler(id)

  return <>
    <SharedNodeToolbar id={id} data={data} type={type} />
    {
      selected && <NodeSelectedIndicator/>
    }
    {
      (!data?.frozen && selected) &&
      <NodeResizer
        color={/*selected ? '#f00' : */'rgba(0,255,0,0.5)'}
        minWidth={15}
        minHeight={15}
        onResize={handleNodeResize}
      />
    }
    { children }
  </>
},
(prev, next) => {
  return isEqual(prev.id, next.id) && isEqual(prev.data, next.data) && isEqual(prev.selected, next.selected) 
});

export default BaseNode