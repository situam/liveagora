import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { nodeActionsWithYkv } from './nodeActions';
import { generateRandomColor, roundToGrid } from './util/utils';
import throttle from 'lodash.throttle'
import { validSpaces } from './consts'
import { isCommunityVersion, defaultAwarenessOptions } from './AgoraApp';
import { Awareness } from 'y-protocols/awareness.js';
import { MiniStatelessRPC } from './rpc';

export class Agora {
  name: string
  url: string | null
  ydoc: Y.Doc
  provider: HocuspocusProvider
  metadata: YKeyValue<unknown>
  awareness: Awareness
  clientID: number | undefined
  rpc: MiniStatelessRPC

  constructor(
    name: string,
    url: string | null,
    onSynced: (name: string) => void,
    onAuthenticationFailed: () => void,
    token: string,
    onAccessRole: (accessRole: string) => void
  ) {
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
        token: token,
        url: this.url,
        name: this.name,
        document: this.ydoc,
        broadcast: false,
        connect: true,
        onStatus: ({ status }) => {
          console.log("onStatus", status)
        },
        onAuthenticated: () => {
          console.log("onAuthenticated, scope:", this.provider.authorizedScope)
        },
        onAuthenticationFailed: (data) => {
          console.log("onAuthenticationFailed", data)
          onAuthenticationFailed()
          this.provider.destroy()
        },
        onSynced: () => {
          onSynced(this.name)

          /**
           * Workaround to make sure self awareness is updated
           * when the connection is (re)established
           */
          if (this.provider.awareness?.getLocalState() != null) {
            this.provider.awareness?.setLocalStateField(
              'tick',
              (this.provider.awareness?.getLocalState()?.tick || 0) + 1
            )
          }
        },
        onDisconnect: ()=>{
          console.log("onDisconnect", this.name)
        },
        onDestroy: () => {
          console.log("onDestroy", this.name)
        },
        onStateless: (data) => {
          console.log("onStateless: data:", data)
          try {
            const rpcBody = JSON.parse(data?.payload)
            this.rpc.receiveMessageObject(rpcBody);

            if (rpcBody.type === 'accessRole') {
              onAccessRole(rpcBody.accessRole)
            }
          } catch (e) {
            console.error("onStateless error", e);
          }
        }
      });
      this.rpc = new MiniStatelessRPC(this.provider);
      this.awareness = this.provider.awareness!;
      this.clientID = this.provider.awareness!.clientID;
    }
    this.awareness!.setLocalState({
      space: defaultAwarenessOptions.space,
      subspace: null,
      id: `awarenesspeer.${this.clientID}`,
      spaceClientID: this.clientID,
      position: { x: 0, y: 0 },
      width: 120,
      height: 120,
      data: {
        name: defaultAwarenessOptions.name,
        style: {
          background: generateRandomColor(),
          borderRadius: '50%'
        }
      },
    })
  }
  setName(name: string) {
    this.awareness.setLocalStateField('data', {
      ...this.awareness?.getLocalState()?.data,
      name
    })
  }
  getName() {
    return this.awareness?.getLocalState()?.data?.name
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
  name: string
  agora: Agora
  awareness: Awareness
  metadata: YKeyValue<unknown>
  tags: YKeyValue<unknown>
  ykv: YKeyValue<unknown>
  nodeActions: Function
  updateAwarenessThrottled: Function
  updateAwarenessFieldThrottled: Function

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
    this.tags = new YKeyValue(this.agora.ydoc.getArray(`${this.name}.tags`))
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
  // TODO: remove this
  getEditPassword() {
    return this.agora.metadata.get(this.name+'-editPw') || 'REDACTED'
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

  get displayName() {
    return this.agora.metadata.get(`${this.name}-displayName`) || this.name
  }
  get isEnabled() {
    return this.agora.metadata.get(`${this.name}-enabled`) || false
  }
  get isPublic() {
    return this.agora.metadata.get(`${this.name}-public`) || false
  }
  get isPublicEditable() {
    return this.agora.metadata.get(`${this.name}-publicEditable`) || false
  }
  get isArchived() {
    return this.agora.metadata.get(`${this.name}-archived`) || false
  }
}

export function hatchAgora(
  base,
  hocuspocusurl,
  onSynced,
  onAuthenticationFailed,
  authToken,
  onAccessRole: (accessRole: string) => void
) {
  console.log("hatchAgora", base)
  /*
  Namespace for community version: 'open/'
  */
  const baseAgora = new Agora(isCommunityVersion ? `open/${base}` : base, hocuspocusurl, onSynced, onAuthenticationFailed, authToken, onAccessRole)
  
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