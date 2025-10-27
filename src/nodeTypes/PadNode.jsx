import { memo } from 'react'
import { BaseNode } from './BaseNode'
import { useSpaceAccessControl } from '../context/AccessControlContext'
import { Pad } from '../components/Pad'
import { useSpace } from '../context/SpaceContext'

export const PadNode = memo(({ data, id, type, selected}) => {
  const { currentRole } = useSpaceAccessControl()
  const { ydoc } = useSpace()

  return (
    <BaseNode editable={currentRole.canEdit} data={data} id={id} type={type} selected={selected}>
      <div
        style={{
          height: '100%',
          //overflow: 'auto', /* uncomment this line and add className="nowheel" to enable scrolling within pad */
          //borderRadius: '0.5em',
          background: '#ff0',
          ...data?.style
        }}
      >
        <Pad ydoc={ydoc} id={id} editable={currentRole.canEdit} selected={selected}/>
      </div>
    </BaseNode>
  )
})