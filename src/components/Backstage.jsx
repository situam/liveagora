import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { YkvTextInput, YkvCheckbox } from './YkvUi'

export function Backstage() {
  const {name} = useAgora()

  const publicLink = `https://taat.live/agora/${name}`
  const backstageLink = `${publicLink}?backstage`
  
  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
      <DashboardBox>
        <h2>agora: {name}</h2>
        <p>public link: <a href={publicLink}>{publicLink}</a></p>
        <p>backstage link: <a href={backstageLink}>backstage</a></p>
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
      <h2>{agora.name}/password</h2>
      <YkvCheckbox ykey={`passwordEnabled`} state={state} metadataYkv={ykv}/>
      <hr/>
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
        <div key={s+'key'}>
          {/* <p key={i}>{s}</p> */}
          <YkvCheckbox ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i+'0'}/>
          <br/>
          {
            state[`${s}-enabled`]?.val && <>
              <YkvTextInput label={'name'} ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i+'1'}/>
              <YkvCheckbox label={'public'} ykey={`${s}-public`} state={state} metadataYkv={ykv} key={i+'2'}/>
              {state[`${s}-public`]?.val && <YkvCheckbox label={'publicEditable'} ykey={`${s}-publicEditable`} state={state} metadataYkv={ykv} key={i+'3'}/>}
              {state[`${s}-public`]?.val && <YkvCheckbox label={'archived'} ykey={`${s}-archived`} state={state} metadataYkv={ykv} key={i+'4'}/>}
              {!state[`${s}-publicEditable`]?.val && <><br/><YkvTextInput label={'edit-mode password'} ykey={`${s}-editPw`} state={state} metadataYkv={ykv} key={i+'5'} defaultValue='REDACTED'/></>}
            </>
          }
          <hr/>
        </div>
      )
      }
    </DashboardBox>
  )
}

