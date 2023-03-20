import { AgoraProvider } from "../context/AgoraContext"
import { SpaceProvider } from "../context/SpaceContext"
import { GatedSpaceFlow } from "./LiveFlow"
import * as LiveAV from './LiveAV';

import { TabView } from "./TabView" 

import { InfoPage } from "./InfoPage"

export function AgoraView({agora, spaces}) {
  return (
    <AgoraProvider agora={agora}>
      <LiveAV.Provider>
        {
        spaces.length > 1 ?
          <TabView
            titles={
              [<i>Werkstatt #3</i>].concat(spaces.map(s=>
                s.displayName || s.name
                //s.metadata.get('spaceDisplayName')||s.name
              ))
            }
            bodies={
              [<InfoPage/>].concat(spaces.map((space,i)=>
                <SpaceProvider space={space} key={i}>
                  <GatedSpaceFlow/>
                </SpaceProvider>
            ))}
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