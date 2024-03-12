import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV'

import { TabView } from "./TabView" 

import { useCfgSpaces } from "../hooks/useCfgSpaces"
import { backButtonEnabled, backButtonDestination } from "../AgoraApp"
import { InfoPage } from "./InfoPage"
import { Backstage } from "./Backstage"

import LeftArrow from "../icons/LeftArrow"
import { useAccessControl, AccessControlProvider, AccessRoles } from "../context/AccessControlContext"

/**
 * @typedef {import('../context/AccessControlContext').AccessRole} AccessRole
 */
/**
 * Determines the user's role based on URL parameters.
 * @returns {AccessRole} The determined role of the user.
 */
function determineUserRoleFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    switch (urlParams.get('role')) {
      case 'owner':
        return AccessRoles.Owner;
      case 'editor':
        return AccessRoles.Editor;
      default:
        return AccessRoles.Viewer;
    }
  } catch (error) {
    console.error('Error determining user role from URL:', error);
    return AccessRoles.Viewer;
  }
}

export function AgoraViewWithAccessControl(props) {
  const role = determineUserRoleFromURL()

  return <AccessControlProvider role={role}>
    <AgoraView {...props} />
  </AccessControlProvider>
}

function AgoraView({agora, spaces}) {
  const { infoPage, cfgSpaces } = useCfgSpaces(agora, spaces)
  const { currentRole } = useAccessControl()

  const titles =
    [
      backButtonEnabled && <span style={{fontSize: '1.4em'}}><LeftArrow/></span>,
      currentRole.canManage && <em>backstage</em>,
      infoPage && <em>{infoPage}</em>, 
      ...cfgSpaces.map(s=>s.displayName || s.name)
    ]
    .filter(el=>el)

  const bodies =
    [
      backButtonEnabled && <></>,
      currentRole.canManage && <Backstage/>,
      infoPage && <InfoPage editable={currentRole.canEdit}/>, 
      ...cfgSpaces.map((s,i)=>
        <SpaceProvider space={s} key={i}>
          <GatedSpaceFlow editable={currentRole.canEdit || s.isPublicEditable} archived={s.isArchived}/>
        </SpaceProvider>
      )
    ]
    .filter(el=>el)
 
  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        <TabView titles={titles} bodies={bodies} backButtonEnabled={backButtonEnabled} backButtonDestination={backButtonDestination}/>
        {/* <SpaceProvider space={spaces[0]}>
          <GatedSpaceFlow/>
        </SpaceProvider> */}
      </LiveAV.Provider>
    </AgoraProvider>
  )
}