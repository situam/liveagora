import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV';

import { TabView } from "./TabView" 

import { useCfgSpaces } from "../hooks/useCfgSpaces"
import { backstageEnabled } from "../AgoraApp";
import { InfoPage } from "./InfoPage"
import { Backstage } from "./Backstage"

export function AgoraView({agora, spaces}) {
  const { infoPage, cfgSpaces } = useCfgSpaces(agora, spaces)

  const titles =
    [
      backstageEnabled && <em>backstage</em>,
      infoPage && <em>{infoPage}</em>, 
      ...cfgSpaces.map(s=>s.displayName || s.name)
    ]
    .filter(el=>el)

  const bodies =
    [
      backstageEnabled && <Backstage/>,
      infoPage && <InfoPage/>, 
      ...cfgSpaces.map((s,i)=>
        <SpaceProvider space={s} key={i}>
          <GatedSpaceFlow/>
        </SpaceProvider>
      )
    ]
    .filter(el=>el)

  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        <TabView titles={titles} bodies={bodies}/>
        {/* <SpaceProvider space={spaces[0]}>
          <GatedSpaceFlow/>
        </SpaceProvider> */}
      </LiveAV.Provider>
    </AgoraProvider>
  )
}