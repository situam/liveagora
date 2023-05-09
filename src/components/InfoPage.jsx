import { Pad, TablePad } from './Pad'

export function InfoPage() {
  return (
    <div style={{padding: '30px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{width: '45vw'}}>
          <Pad id={`infopage.0`} outsideFlow={true} publicEditable={false}/>
        </div>
        <div style={{width: '45vw'}}>
          <TablePad id={`infopage.1`} publicEditable={false} />
        </div>
      </div>
    </div>
  )
}