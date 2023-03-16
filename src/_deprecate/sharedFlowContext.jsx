import React, { createContext, useMemo } from 'react';

import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'

import { HocuspocusProvider } from '@hocuspocus/provider'
const hocuspocusurl = 'ws://localhost:3000'

import { nodeActionsWithYkv } from '../nodeActions'

import { generateRandomColor } from '../util/utils.js'

export const sharedFlowContext = createContext(undefined);

export const SharedFlowProvider = ({ docname, awarenessname, ...props }) => {
  const contextProps = useMemo(() => {
    const doc = new Y.Doc();

    const hocuspocus = new HocuspocusProvider({
      url: hocuspocusurl,
      name: docname,
      document: doc,
      onOpen: () => {
        console.log('hocuspocus opened -', docname)
      },
      //broadcast: false,
      connect: false
    })

    const awareness = hocuspocus.awareness

    awareness.setLocalState({
      id: `awarenesspeer.${awareness.clientID}`,
      //type: 'PeerNode',
      data: {
        name: awarenessname,
        style: {
          background: generateRandomColor()
        }
        //awarenessID: awareness.clientID
      },
      position: { x: 30, y: 30 },
      width: 30,
      height: 30,
    })

    hocuspocus.connect()

    const nodesYkv = new YKeyValue(doc.getArray(`nodes`))
    //const ykvMetadata = new YKeyValue(doc.getArray(`metadata`)) // not used yet

    return {
      doc,
      docname,
      hocuspocus,
      awareness,
      ykv: nodesYkv,
      actions: nodeActionsWithYkv(nodesYkv)
    };
  }, [docname]);

  return <sharedFlowContext.Provider value={contextProps}>{props.children}</sharedFlowContext.Provider>
};