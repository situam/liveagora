import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { nodeActionsWithYkv } from './nodeActions';
import { generateRandomColor, roundToGrid } from './util/utils';


class Agora {
  constructor(name, url) {
    this.name = name;
    this.url = url;
    this.ydoc = new Y.Doc();
    this.provider = new HocuspocusProvider({
      url: this.url,
      name: this.name,
      document: this.ydoc,
      broadcast: false,
      connect: true
    });
    this.awareness = this.provider.awareness;
    this.clientID = this.provider.awareness.clientID;

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
          background: generateRandomColor()
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
  getName(name) {
    return this.awareness.getLocalState().data?.name
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
    //this.metadata = syncedStore({[`${this.name}.metadata`]: {}}, this.agora.ydoc)
   // this.metadata = this.agora.ydoc.getMap(`${this.name}.metadata`)
    this.metadata = new YKeyValue(this.agora.ydoc.getArray(`${this.name}.metadata`))
    this.ykv = new YKeyValue(this.agora.ydoc.getArray(`${this.name}.nodes`))
    this.nodeActions = nodeActionsWithYkv(this.ykv)
  }
  connect() {
    //this.awareness.setLocalStateField('space', this.name)
    this.awareness.setLocalState({
      ...this.awareness.getLocalState(),
      space: this.name,
      position: this.getEntryPosition()
    })
  }
  getEntryPosition() {
    try {
      let r = this.metadata.get('entryRadius') || 300
      let p = Math.random() * 2 * Math.PI
      let x = roundToGrid( Math.cos(p) * parseInt(r), 15)
      let y = roundToGrid( Math.sin(p) * parseInt(r), 15)
      return { x, y }
    }
    catch (e){
      console.error(e)
    }
  }
  disconnect() {
    //
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