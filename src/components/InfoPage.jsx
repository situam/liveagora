import { Pad } from './Pad'

export function InfoPage() {
  return (
    <div style={{height: '100%', padding: '30px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{width: '45vw'}}>
          <Pad id={`doc.workshop3intro`} outsideFlow={true} />
        </div>
        <div style={{width: '45vw'}}>
          <Pad id={`doc.workshop3side`} outsideFlow={true} />
          {/* <TiptapTable field={`doc.workshop2side`}/> */}
        </div>
      </div>
    </div>
  )
}