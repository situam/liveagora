import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { nodeActionsWithYkv } from './nodeActions';
import { generateRandomColor, roundToGrid } from './util/utils';
import throttle from 'lodash.throttle'
import { validSpaces } from './consts'

class Agora {
  constructor(name, url, onSynced) {
    this.name = name.toLowerCase();
    this.url = url;
    this.ydoc = new Y.Doc();
    this.provider = new HocuspocusProvider({
      url: this.url,
      name: this.name,
      document: this.ydoc,
      broadcast: false,
      connect: true,
      onSynced
    });
    this.awareness = this.provider.awareness;
    this.clientID = this.provider.awareness.clientID;
    this.metadata = new YKeyValue(this.ydoc.getArray('metadata'))
    this.awareness.setLocalState({
      space: null,
      subspace: null,
      id: `awarenesspeer.${this.clientID}`,
      spaceClientID: this.clientID,
      position: { x: 0, y: 0 },
      width: 30,
      height: 30,
      data: {
        name: '',
        style: {
          background: generateRandomColor(),
          borderRadius: '50%'
        }
      },
    })
  }
  setName(name) {
    this.awareness.setLocalStateField('data', {
      ...this.awareness.getLocalState().data,
      name
    })
  }
  getName() {
    return this.awareness.getLocalState()?.data?.name
  }
  disconnect() {
    this.awareness.setLocalStateField('space', null)
  }
}

class Space {
  constructor(name, agora) {
    this.name = name;
    this.agora = agora;
    this.awareness = this.agora.awareness
    this.metadata = new YKeyValue(this.agora.ydoc.getArray(`${this.name}.metadata`))
    this.ykv = new YKeyValue(this.agora.ydoc.getArray(`${this.name}.nodes`))
    this.nodeActions = nodeActionsWithYkv(this.ykv)
    this.updateAwarenessThrottled = throttle(this.awareness.setLocalState.bind(this.awareness), 50)
    this.updateAwarenessFieldThrottled = throttle(this.awareness.setLocalStateField.bind(this.awareness), 50)
  }
  connect() {
    this.awareness.setLocalState({
      ...this.awareness.getLocalState(),
      space: this.name,
      position: this.getEntryPosition()
    })
  }
  getEntryPosition() {
    try {
      let r = this.metadata.get('entryRadius') || Math.floor(Math.random()*100)+250
      let p = Math.random() * 2 * Math.PI
      let x = roundToGrid( Math.cos(p) * parseInt(r), 15)
      let y = roundToGrid( Math.sin(p) * parseInt(r), 15)
      return { x, y }
    }
    catch (e){
      console.error(e)
    }
  }
  leave() {
    this.awareness.setLocalState({
      ...this.awareness.getLocalState(),
      space: null,
      subspace: null
    })
  }
}

export function hatchAgora(base, hocuspocusurl, onSynced) {
  const baseAgora = new Agora(base, hocuspocusurl, onSynced)
  
  const spaceCount = validSpaces.length
  const spaces = validSpaces.slice(0, spaceCount).map(space=>new Space(space, baseAgora)) 

  return {
    baseAgora,
    spaces
  }
}

// class IsolatedSpace {
//   constructor(name, agora) {
//     this.name = name;
//     this.agora = agora;

//     this.provider = new HocuspocusProvider({
//       url: agora.provider.url,
//       name: agora.name+'/'+this.name,
//       broadcast: false,
//       connect: false,
//     });
//     this.awareness=this.provider.awareness
    
//     this.ykv = new YKeyValue(agora.ydoc.getArray(`${this.name}.nodes`))
//     this.nodeActions = nodeActionsWithYkv(this.ykv)
//   }
//   connect() {
//     this.awareness.setLocalStateField('space', space.name)
//     this.provider.connect()
//   }
//   disconnect() {
//     this.awareness.setLocalState(null)
//     this.provider.disconnect()
//   }
// }

export default { Agora, Space }