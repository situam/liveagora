import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { nodeActionsWithYkv } from './nodeActions';
import { generateRandomColor, roundToGrid } from './util/utils';
import throttle from 'lodash.throttle'
import { validSpaces } from './consts'
import { isCommunityVersion } from './AgoraApp';
import { Awareness } from 'y-protocols/awareness.js';

/**
 * Agora data structure
 * 
 * @class
 * @property {string} name - The name of the Agora environment, in lowercase.
 * @property {string | null} url - The URL for the HocuspocusProvider connection.
 * @property {Y.Doc} ydoc - A Yjs document for collaborative data.
 * @property {HocuspocusProvider} provider - The Hocuspocus provider instance.
 * @property {any} awareness - The awareness state from the provider.
 * @property {number} clientID - The client ID from the awareness state.
 * @property {YKeyValue} metadata - Key-value storage for metadata, using a Yjs array.
 */
export class Agora {
  constructor(name, url, onSynced) {
    this.name = name.toLowerCase();
    this.url = url;
    this.ydoc = new Y.Doc();
    this.metadata = new YKeyValue(this.ydoc.getArray('metadata'))
    if (this.url == null)
    {
      console.log("[Agora] provider url is null: init local-only");
      this.awareness = new Awareness(this.ydoc);
      this.clientID = this.awareness.clientID;
      return;
    }
    else
    {
      this.provider = new HocuspocusProvider({
        url: this.url,
        name: this.name,
        document: this.ydoc,
        broadcast: false,
        connect: true,
        onSynced: () => onSynced(this.name),
        onDisconnect: ()=>{
          console.log("hocuspocus disconnect", this.name)
        },
        onDestroy: () => {
          console.log("hocuspocus destroy", this.name)
        }
      });
      this.awareness = this.provider.awareness;
      this.clientID = this.provider.awareness.clientID;
    }
    this.awareness.setLocalState({
      space: null,
      subspace: null,
      id: `awarenesspeer.${this.clientID}`,
      spaceClientID: this.clientID,
      position: { x: 0, y: 0 },
      width: 120,
      height: 120,
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
    console.log("[agora::disconnect]")
    this.awareness.setLocalStateField('space', null)
  }
}

/**
 * Represents a collaborative space with awareness and node management.
 * @class
 * @property {string} name 
 * @property {Agora} agora
 * @property {Object} awareness 
 * @property {YKeyValue} metadata 
 * @property {YKeyValue} ykv 
 * @property {Function} nodeActions 
 * @property {Function} updateAwarenessThrottled 
 * @property {Function} updateAwarenessFieldThrottled 
 */
export class Space {
  /**
   * 
   * @param {string} name - a steady id, so far space00, space01, etc
   * @param {Agora} agora 
   */
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
      subspace: null, // no subspace on connect to new space
      position: this.getEntryPosition()
    })
  }
  getEditPassword() {
    return this.agora.metadata.get(this.name+'-editPw') || 'blackberry'
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
  console.log("hatchAgora", base)
  /*
  Namespace for community version: 'open/'
  */
  const baseAgora = new Agora(isCommunityVersion ? `open/${base}` : base, hocuspocusurl, onSynced)
  
  const spaceCount = validSpaces.length
  const spaces = validSpaces.slice(0, spaceCount).map(space=>new Space(space, baseAgora)) 

  window.agora = baseAgora

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