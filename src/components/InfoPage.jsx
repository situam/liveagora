import { backstageEnabled } from '../AgoraApp'
import { Pad, TablePad } from './Pad'

export function InfoPage() {
  return (
    <div style={{padding: '30px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{width: '45vw'}}>
          <Pad id={`doc.workshop3intro`} outsideFlow={true} editable={backstageEnabled}/>
        </div>
        <div style={{width: '45vw'}}>
          <TablePad id={`doc.workshop3side`} editable={backstageEnabled} />
          {/* <TiptapTable field={`doc.workshop2side`}/> */}
        </div>
      </div>
    </div>
  )
}