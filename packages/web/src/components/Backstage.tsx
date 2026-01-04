import { VALID_SPACE_IDS } from '@liveagora/common'
import { useAgoraAccessControl } from '../context/AccessControlContext'
import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { BackstageUnlockButton } from './Backstage/BackstageUnlockButton'
import { YkvTextInput, YkvCheckbox } from './YkvUi'

export default function Backstage() {
  const { currentRole } = useAgoraAccessControl()

  if (!currentRole.canEdit) {
    return <BackstageUnlockButton/>
  }

  return (
    <div>
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
      <h2>{agora.name}/Spaces</h2>
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
            <th scope="col">password to edit</th>
            <th scope="col" className="col-checkbox">archive view mode</th>
          </tr>
        </thead>
      {
      VALID_SPACE_IDS.map((s,i) =>
        <tr key={s+'key'}>
          <td className="col-checkbox">
            <YkvCheckbox label=' ' ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i+'0'}/>
          </td>
          <td>
            <YkvTextInput label=' ' ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i+'1'}/>
          </td>
          <td>
            <em>(same as backstage password){' '}</em>
            <button>change</button>
            <button>reset</button>
          </td>
          <td className="col-checkbox">
            <YkvCheckbox label=' ' ykey={`${s}-archived`} state={state} metadataYkv={ykv} key={i+'4'}/>
          </td>
        </tr>
      )
      }
      </table>
    </DashboardBox>
  </>)
}

