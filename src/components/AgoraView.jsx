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

  const cfgTitles = cfgSpaces.map(s=>s.displayName || s.name)
  const cfgBodies = cfgSpaces.map((s,i)=>
    <SpaceProvider space={s} key={i}>
      <GatedSpaceFlow/>
    </SpaceProvider>
  )

  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        {
        (true || cfgSpaces.length > 1) ?
          <TabView
            titles={
              backstageEnabled ?
                [<em>backstage</em>].concat(cfgTitles)
              :
                cfgTitles
            }
            bodies={
              backstageEnabled ?
                [<Backstage/>].concat(cfgBodies)
              :
                cfgBodies
            }
          />
        :
          <SpaceProvider space={spaces[0]}>
            <GatedSpaceFlow/>
          </SpaceProvider>
        }
      </LiveAV.Provider>
    </AgoraProvider>
  )
}