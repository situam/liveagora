import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { YkvTextInput, YkvCheckbox } from './YkvUi'

export function Backstage() {
  const {name} = useAgora()

  const publicLink = `https://preview.taat.live/?agora=${name}`
  const backstageLink = `${publicLink}&backstage`
  
  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
      <DashboardBox>
        <p>Welcome backstage</p>
        <p>Please take care</p>
        <p>links:</p>
        <p><a href={publicLink}>public</a></p>
        <p><a href={backstageLink}>backstage</a></p>
      </DashboardBox>
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
      <h2>{agora.name}/LiveAV</h2>
      <YkvTextInput ykey={'liveAV/roomID'} state={state} metadataYkv={ykv}/>
    </DashboardBox>
  )
}

function SpaceListPanel() {
  const agora = useAgora()
  const { state, ykv } = useYkv(agora.metadata)

  return (
    <DashboardBox>
      <h2>{agora.name}/metadata</h2>
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
          {/* <p key={i}>{s}</p> */}
          <YkvCheckbox ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i}/>
          <br/>
          {
            state[`${s}-enabled`]?.val && <>
              <YkvTextInput label={'name'} ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i}/>
              <YkvCheckbox label={'public'} ykey={`${s}-public`} state={state} metadataYkv={ykv} key={i}/>
              {state[`${s}-public`]?.val && <YkvCheckbox label={'publicEditable'} ykey={`${s}-publicEditable`} state={state} metadataYkv={ykv} key={i}/>}
              
            </>
          }
          <hr/>
        </>
      )
      }
    </DashboardBox>
  )
}

