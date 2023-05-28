import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV'

import { TabView } from "./TabView" 

import { useCfgSpaces } from "../hooks/useCfgSpaces"
import { backstageEnabled, backButtonEnabled, backButtonDestination } from "../AgoraApp"
import { InfoPage } from "./InfoPage"
import { Backstage } from "./Backstage"

import LeftArrow from "../icons/LeftArrow"

export function AgoraView({agora, spaces}) {
  const { infoPage, cfgSpaces } = useCfgSpaces(agora, spaces)

  const titles =
    [
      backButtonEnabled && <span style={{fontSize: '1.4em'}}><LeftArrow/></span>,
      backstageEnabled && <em>backstage</em>,
      infoPage && <em>{infoPage}</em>, 
      ...cfgSpaces.map(s=>s.displayName || s.name)
    ]
    .filter(el=>el)

  const bodies =
    [
      backButtonEnabled && <></>,
      backstageEnabled && <Backstage/>,
      infoPage && <InfoPage editable={backstageEnabled}/>, 
      ...cfgSpaces.map((s,i)=>
        <SpaceProvider space={s} key={i}>
          <GatedSpaceFlow editable={backstageEnabled || s.isPublicEditable} archived={s.isArchived}/>
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