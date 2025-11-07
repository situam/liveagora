import { createContext, useContext, useMemo, useEffect, useState} from 'react'
import { AgoraContext } from "./AgoraContext"

import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { Awareness } from 'y-protocols/awareness';
import { HocuspocusProvider } from '@hocuspocus/provider'

import { nodeActionsWithYkv } from '../nodeActions';

import { generateRandomColor } from '../util/utils';

export const SpaceContext = createContext(null)

export function SpaceProvider({space, ...props}) {
  const agora = useContext(AgoraContext)
  const name = space
  const [contextProps, setContextProps] = useState(null)

  // const contextProps = useMemo(()=>{
  //   console.log("[SpaceProvider] setting up", space)

  //   /*const awareness = new Awareness(agora.rootDoc) // pass it the same rootDoc just to keep clientID

  //   // add a new provider that only syncs another awareness instance. The ydoc will never be updated
  //   const provider = new HocuspocusProvider({
  //     url: agora.rootProvider.url,
  //     name: name,
  //     document: new Y.Doc(),
  //     awareness: awareness, 
  //     onOpen: () => {
  //       console.log('[SpaceHocuspocus] opened', name)
  //     },
  //     onConnect: () => {
  //       // 
  //     },
  //     broadcast: false,
  //     connect: false,
  //   });*/

  //   const ykv = new YKeyValue(agora.rootDoc.getArray(space+'.nodes'))
  //   const metadata = new YKeyValue(agora.rootDoc.getArray(space+'.metadata'))

  //   agora.rootProvider.awareness.setLocalState({
  //     id: `awarenesspeer.${agora.rootProvider.awareness.clientID}`,
  //     data: {
  //       name: generateRandomColor(),
  //       style: {
  //         background: generateRandomColor()
  //       }
  //     },
  //     position: { x: 30, y: 30 },
  //     width: 30,
  //     height: 30,
  //   })

  //   //provider.connect()

  //   return {
  //     //provider,
  //     awareness: agora.rootProvider.awareness,
  //     ykv,
  //     nodeActions: nodeActionsWithYkv(ykv),
  //     metadata
  //   }
  // }, [space])
  
  useEffect(()=>{
    console.log("[SpaceProvider] setting up", space)

    const awareness = new Awareness(agora.rootDoc) // pass it the same rootDoc just to keep clientID

    // add a new provider that only syncs another awareness instance. The ydoc will never be updated
    const provider = new HocuspocusProvider({
      url: agora.rootProvider.url,
      name: name,
      document: new Y.Doc(),
      awareness: awareness, 
      onOpen: () => {
        console.log('[SpaceHocuspocus] opened', name)
      },
      onConnect: () => {
        console.log('[SpaceHocuspocus] connected', name)
      },
      broadcast: false,
      connect: true,
    });

    const ykv = new YKeyValue(agora.rootDoc.getArray(space+'.nodes'))
    const metadata = new YKeyValue(agora.rootDoc.getArray(space+'.metadata'))


    awareness.setLocalState({
      id: `awarenesspeer.${awareness.clientID}`,
      data: {
        name: generateRandomColor(),
        style: {
          background: generateRandomColor()
        }
      },
      position: { x: 30, y: 30 },
      width: 30,
      height: 30,
    })

    //provider.connect()

    setContextProps({
      provider,
      awareness: awareness,
      ykv,
      nodeActions: nodeActionsWithYkv(ykv),
      metadata
    })

    // addEventListener('unload', (event) => {
    //   if (provider)
    //     provider.destroy()
    // });

    return () => {
      console.log("[SpaceProvider] cleaning up", space)
      setContextProps(null)
      provider.destroy()
    }
  }, [agora])

  if (!contextProps)
    return <p>Loading...</p>

  return <SpaceContext.Provider value={contextProps}>
    {props.children}
  </SpaceContext.Provider>
}