import { useAccessControl } from '../context/AccessControlContext'
import { Pad, TablePad } from './Pad'

export function InfoPage() {
  const { currentRole } = useAccessControl()

  return (
    <div style={{padding: '30px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <Pad id={`infopage.0`} outsideFlow={true} editable={currentRole.canEdit}/>
        </div>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <TablePad id={`infopage.1`} publicEditable={false} />
        </div>
      </div>
    </div>
  )
}