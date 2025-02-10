import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { YkvTextInput, YkvCheckbox } from './YkvUi'

export function Backstage() {
  return (
    <div>
      <br/>

      <SpaceListPanel/>
      <MiscMetadataPanel/>
    </div>
  )
}

function DashboardBox({children}) {
  return (
    <div style={{marginBottom: '1rem', border: '1px solid var(--ux-color-secondary)', padding: '1rem', overflow: 'auto'}}>
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
      <br/>
      <h2>{agora.name}/LiveAV</h2>
      <YkvTextInput ykey={'liveAV/roomID'} state={state} metadataYkv={ykv}/>
    </DashboardBox>
  )
}

function SpaceListPanel() {
  const agora = useAgora()
  const { state, ykv } = useYkv(agora.metadata)

  return (<>
    <DashboardBox>
      <YkvTextInput label={'linked agoras (enter as comma-separated list)'} ykey={`linkedAgoras`} state={state} metadataYkv={ykv}/>
    </DashboardBox>
    <DashboardBox>
      <h2>Spaces</h2>
      <YkvCheckbox ykey={`infopage-enabled`} state={state} metadataYkv={ykv}/><br/>
      {
        state[`infopage-enabled`]?.val && <>
          <YkvTextInput label={'displayName'} ykey={`infopage-displayName`} state={state} metadataYkv={ykv}/>
        </> 
      }
      <table className="dashboard-table">
        <thead>
          <tr>
            <th scope="col" className="col-checkbox">enabled</th>
            <th scope="col">name</th>
            <th scope="col" className="col-checkbox">public visible</th>
            <th scope="col" className="col-checkbox">public editable</th>
            <th scope="col">edit password</th>
            <th scope="col" className="col-checkbox">archive view mode</th>
          </tr>
        </thead>
      {
      ['space00', 'space01', 'space02', 'space03', 'space04', 'space05'].map((s,i) =>
        <tr key={s+'key'} style={!state[`${s}-enabled`]?.val ? {opacity: 0.5} : {}}>
          {/* <p key={i}>{s}</p> */}
          <td className="col-checkbox">
            <YkvCheckbox label=' ' ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i+'0'}/>
          </td>
          {
            (true || state[`${s}-enabled`]?.val) && <>
              <td>
                <YkvTextInput label=' ' ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i+'1'}/>
              </td>
              <td className="col-checkbox">
                <YkvCheckbox label=' ' ykey={`${s}-public`} state={state} metadataYkv={ykv} key={i+'2'}/>
              </td>
              <td className="col-checkbox">
                {state[`${s}-public`]?.val && <YkvCheckbox label=' ' ykey={`${s}-publicEditable`} state={state} metadataYkv={ykv} key={i+'3'}/>}
              </td>
              <td>
                {!state[`${s}-publicEditable`]?.val && <><br/><YkvTextInput label=' ' ykey={`${s}-editPw`} state={state} metadataYkv={ykv} key={i+'5'} defaultValue=''/></>}
              </td>
              <td className="col-checkbox">
                {state[`${s}-public`]?.val && <YkvCheckbox label=' ' ykey={`${s}-archived`} state={state} metadataYkv={ykv} key={i+'4'}/>}
              </td>
            </>
          }

        </tr>
      )
      }
      </table>
    </DashboardBox>
  </>)
}

