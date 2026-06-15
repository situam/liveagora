export type AwarenessState = {
  id: string,
  position: { x: number, y: number },
  width: number,
  height: number,
  data: {
    name: string,
    /**
     * callStatus message is displayed next to the name
     */
    callStatus?: string | null,
    style?: React.CSSProperties
  },
  space: string | null,
  subspace: string | null,
  spaceClientID: number,
  screenshare?: AwarenessScreenshareState,
  tick?: number,
}

export type AwarenessScreenshareState = {
  position: { x: number, y: number },
  width: number,
  height: number,
  data: {
    /**
     * liveAVId is the peer ID of the user who is screensharing
     */
    liveAVId: string,
    label: string
  },
  spaceClientID: number
}
