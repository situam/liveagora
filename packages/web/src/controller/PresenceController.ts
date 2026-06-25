import { Awareness } from "y-protocols/awareness.js"
import { getDefaultAwarenessOptions, setAgoraPresenceMemory } from "../AgoraApp"
import { AwarenessScreenshareState, AwarenessState } from "../model/AwarenessState"
import { TypedAwareness } from "../model/TypedAwareness"
import { Space } from "../agoraHatcher"

export class PresenceController {
  private yawareness: Awareness
  private awareness: TypedAwareness<AwarenessState>
  constructor(awareness: Awareness) {
    this.yawareness = awareness
    this.awareness = new TypedAwareness<AwarenessState>(awareness)
    this._syncAwarenessWithPresenceMemory = this._syncAwarenessWithPresenceMemory.bind(this)
  }

  initState() {
    const defaultAwarenessOptions = getDefaultAwarenessOptions()
    this.awareness.setLocalState({
      space: defaultAwarenessOptions.space,
      subspace: null,
      id: `awarenesspeer.${this.awareness.clientID}`,
      spaceClientID: this.awareness.clientID,
      position: { x: 0, y: 0 },
      width: defaultAwarenessOptions.width,
      height: defaultAwarenessOptions.height,
      data: {
        name: defaultAwarenessOptions.name,
        style: defaultAwarenessOptions.style,
      },
    })
  }

  _syncAwarenessWithPresenceMemory() {
    const state = this.getLocalState()
    if (!state) return
    setAgoraPresenceMemory(state)
  }
  subscribeAwareness() {
    this.yawareness.on('change', this._syncAwarenessWithPresenceMemory)
  }
  unsubscribeAwareness() {
    this.yawareness.off('change', this._syncAwarenessWithPresenceMemory)
  }

  getLocalState() {
    return this.awareness.getLocalState()
  }

  enterSpace(space: Space) {
    const state = this.awareness.getLocalState()!
    let nextState = {
      ...state,
      space: space.name,
      subspace: null, // no subspace on connect to new space
      position: space.getEntryPosition()
    }
    delete nextState.screenshare
    this.awareness.setLocalState(nextState)
  }

  leaveSpace() {
    const state = this.awareness.getLocalState()
    if (!state) return

    let nextState = {
      ...state,
      space: null,
      subspace: null,
      data: {
        ...state.data,
        callStatus: null
      }
    }
    delete nextState.screenshare
    this.awareness.setLocalState(nextState)
  }

  startScreenshare(liveAVId: string) {
    const state = this.awareness.getLocalState()!
    const screenshareState: AwarenessScreenshareState = {
      position: {
        x: state.position.x,
        y: state.position.y + state.height + 30,
      },
      width: 600,
      height: 420,
      data: {
        liveAVId: liveAVId,
        label: `${state.data.name}'s screen`,
      },
      spaceClientID: this.awareness.clientID
    }
    this.awareness.setLocalStateField('screenshare', screenshareState)
  }

  stopScreenshare() {
    const state = this.awareness.getLocalState()!
    if (!state) return
    const {
      screenshare,
      ...nextState
    } = state
    this.awareness.setLocalState(nextState)
  }

  setStatusMsg(msg: string) {
    this.awareness.setLocalStateField('data', {
      ...this.awareness.getLocalState()!.data,
      callStatus: msg
    })
  }

  setName(name: string) {
    this.awareness.setLocalStateField('data', {
      ...this.awareness?.getLocalState()?.data,
      name
    })
  }

  setPosition(position: {x: number, y: number}) {
    this.awareness.setLocalStateField('position', position)
  }

  getName() {
    return this.awareness?.getLocalState()?.data?.name
  }

  getCountInSpace(spaceName: string) {
    return Array.from(this.awareness.getStates().values()).filter(state=>state.space==spaceName).length
  }
}