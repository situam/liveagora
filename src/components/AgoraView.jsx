import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV';

import { TabView } from "./TabView" 

import { useCfgSpaces } from "../hooks/useCfgSpaces"

import { InfoPage } from "./InfoPage"

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
        cfgSpaces.length > 1 ?
          <TabView
            titles={
              infoPage ?
                [<em>{infoPage}</em>].concat(cfgTitles)
              :
                cfgTitles
            }
            bodies={
              infoPage ?
                [<InfoPage/>].concat(cfgBodies)
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