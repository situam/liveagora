import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV';

import { TabView } from "./TabView" 

export function AgoraView({agora, spaces}) {
  //console.log("[AgoraView] hello ", agora, spaces)
  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        {
        spaces.length > 1 ?
          <TabView titles={spaces.map(s=>s.metadata.get('spaceDisplayName')||s.name)} bodies={
            spaces.map((space,i)=>
              <SpaceProvider space={space} key={i}>
                <GatedSpaceFlow/>
              </SpaceProvider>
          )}/>
        :
          <SpaceProvider space={spaces[0]}>
            <GatedSpaceFlow/>
          </SpaceProvider>
        }
      </LiveAV.Provider>
    </AgoraProvider>
  )
}