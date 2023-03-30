import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { YkvTextInput, YkvCheckbox } from './YkvUi'

export function Backstage() {
  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
      <SpaceListPanel/>
      <MiscMetadataPanel/>
    </div>
  )
}

function DashboardBox({children}) {
  return (
    <div style={{maxHeight: '80vh', overflow: 'auto', maxWidth: '400px', borderRadius: '5px', padding: '15px', border: '1px solid black'}}>
      {children}
    </div>
  )
}

function MiscMetadataPanel() {
  const agora = useAgora()
  const { state, ykv } = useYkv(agora.metadata)

  return (
    <DashboardBox>
      <h2>liveAV</h2>
      <YkvTextInput ykey={'liveAV/roomID'} state={state} metadataYkv={ykv}/>
    </DashboardBox>
  )
}

function SpaceListPanel() {
  const agora = useAgora()
  const { state, ykv } = useYkv(agora.metadata)

  return (
    <DashboardBox>
      
      <YkvCheckbox ykey={`infopage-enabled`} state={state} metadataYkv={ykv}/><br/>
          {
            state[`infopage-enabled`]?.val && <>
              <YkvTextInput label={'displayName'} ykey={`infopage-displayName`} state={state} metadataYkv={ykv}/>
            </> 
          }
      <hr/>
      {
      ['space00', 'space01', 'space02', 'space03', 'space04', 'space05'].map((s,i) =>
        <>
          {/* <h2 key={i}>{s}</h2> */}
          <YkvCheckbox ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i}/>
          <br/>
          {
            state[`${s}-enabled`]?.val && <>
              <YkvTextInput label={'name'} ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i}/>
            </>
          }
          <hr/>
        </>
      )
      }
    </DashboardBox>
  )
}

