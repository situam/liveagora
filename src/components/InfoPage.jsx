import { useAgoraAccessControl } from '../context/AccessControlContext'
import { useAgora } from '../context/AgoraContext'
import { Pad, TablePad } from './Pad'

export function InfoPage() {
  const { currentRole } = useAgoraAccessControl()
  const { ydoc } = useAgora()

  return (
    <div style={{padding: '30px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <Pad ydoc={ydoc} id={`infopage.0`} outsideFlow={true} editable={currentRole.canEdit}/>
        </div>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <TablePad ydoc={ydoc} id={`infopage.1`} publicEditable={false} />
        </div>
      </div>
    </div>
  )
}