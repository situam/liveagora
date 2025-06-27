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
import { UrlParam } from "../lib/navigate"
import { SidebarProvider } from "./Sidebar"
import { SpaceSidebar } from "./SpaceSidebar"

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
    switch (urlParams.get(UrlParam.Role)) {
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

function SpaceView({space}) {
  const { currentRole } = useAccessControl()

  return <SidebarProvider><SpaceProvider space={space}>
    <div className="fullscreen-flow-container">
      <GatedSpaceFlow editable={currentRole.canEdit || space.isPublicEditable} archived={space.isArchived}/>
    </div>
    <SpaceSidebar/>
  </SpaceProvider></SidebarProvider>
}

function AgoraView({agora, spaces}) {
  const { infoPage, cfgSpaces } = useCfgSpaces(agora, spaces)
  const { currentRole } = useAccessControl()

  const titles =
    [
      backButtonEnabled && <span style={{fontSize: '1.4em'}}><LeftArrow/></span>,
      currentRole.canManage && <em>backstage</em>,
      infoPage && <em>{infoPage}</em>, 
      ...cfgSpaces.map(s=>s.displayName)
    ]
    .filter(el=>el)

  const bodies =
    [
      backButtonEnabled && <></>,
      currentRole.canManage && <Backstage/>,
      infoPage && <InfoPage editable={currentRole.canEdit}/>, 
      ...cfgSpaces.map((s,i)=>
        <SpaceView space={s} key={i} />
      )
    ]
    .filter(el=>el)
 
  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        {/* <SidebarProvider> */}
          <TabView titles={titles} bodies={bodies} backButtonEnabled={backButtonEnabled} backButtonDestination={backButtonDestination}/>
        {/* </SidebarProvider> */}
        {/* <SpaceProvider space={spaces[0]}>
          <GatedSpaceFlow/>
        </SpaceProvider> */}
      </LiveAV.Provider>
    </AgoraProvider>
  )
}