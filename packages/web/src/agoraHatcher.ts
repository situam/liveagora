import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue'
import { nodeActionsWithYkv } from './nodeActions';
import { generateRandomColor, roundToGrid } from './util/utils';
import throttle from 'lodash.throttle'
import { validSpaces } from './consts'
import { defaultAwarenessOptions } from './AgoraApp';
import { Awareness } from 'y-protocols/awareness.js';
import { SyncedYdocProvider } from './lib/syncedYdocProvider';
import { AccessRole } from './context/AccessControlContext';
import { DocumentNames } from '@liveagora/common';
import { Env } from './config/env';

export class Agora {
  name: string
  url: string | null
  ydoc: Y.Doc
  metadata: YKeyValue<unknown>
  awareness: Awareness
  
  syncProvider: SyncedYdocProvider | null = null
  spaces: Space[] = []

  constructor(
    name: string,
    url: string | null,
    onSynced: (name: string) => void,
    onAuthenticationFailed: () => void,
    token: string,
    onAccessRole: (accessRole: AccessRole) => void
  ) {
    this.name = name.toLowerCase();
    this.url = url;
    this.ydoc = new Y.Doc();
    this.metadata = new YKeyValue(this.ydoc.getArray('metadata'))
    if (this.url == null)
    {
      console.log("[Agora] provider url is null: init local-only");
      this.awareness = new Awareness(this.ydoc);
      return;
    }
    else
    {
      this.syncProvider = new SyncedYdocProvider({
        ydoc: this.ydoc,
        documentName: DocumentNames.buildAgoraDoc(this.name),
        url: this.url,
        token: token,
        onSynced: () => {
          onSynced(this.name)

          /**
           * Workaround to make sure self awareness is updated
           * when the connection is (re)established
           */
          if (this.awareness?.getLocalState() != null) {
            this.awareness?.setLocalStateField(
              'tick',
              (this.awareness?.getLocalState()?.tick || 0) + 1
            )
          }
        },
        onAuthenticationFailed: onAuthenticationFailed,
        onAccessRole: onAccessRole
      })

      // connect immediately
      this.syncProvider.initProvider().catch((err) => { console.error(err) })
      this.awareness = this.syncProvider.awareness!;
    }
    this.awareness.setLocalState({
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
  get clientID() {
    return this.awareness?.clientID
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

    this.syncProvider?.destroy()
    this.spaces.map(space => space.leave())
  }
}

export class Space {
  name: string
  agora: Agora
  awareness: Awareness

  ydoc: Y.Doc
  syncProvider: SyncedYdocProvider | null = null

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
  constructor(name: string, agora: Agora) {
    this.name = name;
    this.agora = agora;
    this.awareness = this.agora.awareness

    this.ydoc = new Y.Doc();

    this.metadata = new YKeyValue(this.ydoc.getArray(`metadata`))
    this.tags = new YKeyValue(this.ydoc.getArray(`tags`))
    this.ykv = new YKeyValue(this.ydoc.getArray(`nodes`))

    this.nodeActions = nodeActionsWithYkv(this.ykv)
    this.updateAwarenessThrottled = throttle(this.awareness.setLocalState.bind(this.awareness), 50)
    this.updateAwarenessFieldThrottled = throttle(this.awareness.setLocalStateField.bind(this.awareness), 50)

    if (this.agora.syncProvider != null) {
      this.syncProvider = new SyncedYdocProvider({
        ydoc: this.ydoc,
        documentName: DocumentNames.buildSpaceDoc(this.agora.name, this.name),
        url: this.agora.url!,
        token: this.agora.syncProvider.config.token
      });
    }
  }

  async connect(
    token: string | null,
    onAccessRole: (accessRole: AccessRole) => void
  ): Promise<void> {
    console.log("[Agora::Space] connect", this.name, token)

    const setAwarenessAsConnected = () => {
      this.awareness.setLocalState({
        ...this.awareness.getLocalState(),
        space: this.name,
        subspace: null, // no subspace on connect to new space
        position: this.getEntryPosition()
      })
    }

    try {
      if (this.syncProvider != null) {
        this.syncProvider!.config.onAccessRole = onAccessRole
        await this.syncProvider!.initProvider(token)
      }
      if (!this.isArchived) {
        // space is not in archived mode - connect awareness
        setAwarenessAsConnected()
      }
    } catch (e) {
      console.error("[Agora::Space] connect error", e)
      return Promise.reject(e)
    }
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
    // Note: leave is not always called, e.g. when the user switches to another space
    if (this.syncProvider != null) {
      this.syncProvider.destroy()
    }

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
  // TODO: deprecate
  get isPublic() {
    return this.agora.metadata.get(`${this.name}-public`) || false
  }
  // TODO: deprecate
  get isPublicEditable() {
    return this.agora.metadata.get(`${this.name}-publicEditable`) || false
  }
  get isArchived() {
    return this.agora.metadata.get(`${this.name}-archived`) || false
  }
}

export function hatchAgora(
  base: string,
  hocuspocusurl: string,
  onSynced: (name: string) => void,
  onAuthenticationFailed: () => void,
  authToken: string,
  onAccessRole: (accessRole: AccessRole) => void
): Agora {
  console.log("hatchAgora", base)
  const baseAgora = new Agora(`${Env.docNamespace}${base}`, hocuspocusurl, onSynced, onAuthenticationFailed, authToken, onAccessRole)
  
  const spaceCount = validSpaces.length
  baseAgora.spaces = validSpaces.slice(0, spaceCount).map(space=>new Space(space, baseAgora)) 

  window.agora = baseAgora

  return baseAgora
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