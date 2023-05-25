import { Pad, TablePad } from './Pad'

export function InfoPage() {
  return (
    <div style={{padding: '30px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <Pad id={`infopage.0`} outsideFlow={true} publicEditable={false}/>
        </div>
        <div style={{minWidth: '200px', maxWidth: '600px'}}>
          <TablePad id={`infopage.1`} publicEditable={false} />
        </div>
      </div>
    </div>
  )
}