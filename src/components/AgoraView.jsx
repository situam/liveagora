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

import { SidebarContent, SidebarProvider } from "./Sidebar"
import { SpaceInfoSidebarLoader } from "./SpaceSidebar"

function SpaceView({space}) {
  return <SpaceAccessControlProvider>
    <SidebarProvider>
      <SpaceProvider space={space}>
        <SpaceInfoSidebarLoader/>
        <SidebarContent/>
        {/* <div className="fullscreen-flow-container"> */}
          <GatedSpaceFlow archived={s.isArchived}/>
        {/* </div> */}
      </SpaceProvider>
    </SidebarProvider>
  </SpaceAccessControlProvider>
}

export function AgoraView({agora, spaces}) {
  const { infoPage, cfgSpaces } = useCfgSpaces(agora, spaces)

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