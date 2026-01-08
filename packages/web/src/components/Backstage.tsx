import { DocumentNames, SpaceId, VALID_SPACE_IDS } from '@liveagora/common'
import { useAgoraAccessControl } from '../context/AccessControlContext'
import { useAgora } from '../context/AgoraContext'
import { useYkv } from '../hooks/useYkv'
import { BackstageUnlockButton } from './Backstage/BackstageUnlockButton'
import { YkvTextInput, YkvCheckbox } from './YkvUi'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as API from "../admin/api"
import { DashboardBox } from './Backstage/DashboardBox'
import { AccessMode, AccessModeEditor } from './Backstage/AccessModeEditor'

const queryClient = new QueryClient();

export default function BackstageQueryProvider() {
  return <QueryClientProvider client={queryClient}>
    <Backstage/>
  </QueryClientProvider>
}

export function Backstage() {
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

  const spacePasswordsQuery = useQuery({
    queryKey: ["space-passwords", agora.name],
    queryFn: () =>
      API.getSpacePasswords(agora.name, agora.syncProvider!.config.token),
  })

  if (spacePasswordsQuery.isLoading) {
    return <DashboardBox>Loading space passwords…</DashboardBox>
  }

  if (spacePasswordsQuery.error) {
    return <DashboardBox>Error loading passwords</DashboardBox>
  }

  const passwordMap = Object.fromEntries(
    spacePasswordsQuery.data.map(s => [DocumentNames.parseSpaceIdFromDocName(s.id), s.edit_password]),
  )

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
            <th scope="col">edit access</th>
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
            <YkvTextInput label=' ' ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i+'1'}
              disabled={!ykv.get(`${s}-enabled`)}
            />
          </td>
          <td>
            <SpaceEditAccessEditor
              agoraId={agora.name}
              spaceId={s}
              password={passwordMap[s]}
              token={agora.syncProvider!.config.token}
              disabled={!ykv.get(`${s}-enabled`)}
            />
          </td>
          <td className="col-checkbox">
            <YkvCheckbox label=' ' ykey={`${s}-archived`} state={state} metadataYkv={ykv} key={i+'4'}
              disabled={!ykv.get(`${s}-enabled`)}
            />
          </td>
        </tr>
      )
      }
      </table>
    </DashboardBox>
  </>)
}


const spaceEditModeLabelMap = new Map([
  [AccessMode.default, "password (same as backstage)"],
  [AccessMode.public, "public"],
  [AccessMode.custom, "password (custom)"],
])

function SpaceEditAccessEditor({
  agoraId,
  spaceId,
  password,
  token,
  disabled = false
}: {
  agoraId: string
  spaceId: SpaceId
  password?: string | null | undefined
  token: string
  disabled: boolean
}) {
  const qc = useQueryClient()

  const setMutation = useMutation({
    mutationFn: (pw: string | null) =>
      API.putSpacePassword(token, {
        agoraId,
        spaceId,
        row: { edit_password: pw },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["space-passwords", agoraId] })
  })

  const resetMutation = useMutation({
    mutationFn: () =>
      API.deleteSpacePassword(agoraId, spaceId, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["space-passwords", agoraId] })
  })

  return <AccessModeEditor
    modeLabelMap={spaceEditModeLabelMap}
    password={password}
    onUpdate={setMutation.mutate}
    onDelete={resetMutation.mutate}
    disabled={disabled}
  />
}