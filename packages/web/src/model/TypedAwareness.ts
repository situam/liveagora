import { Awareness } from "y-protocols/awareness.js";

export class TypedAwareness<T extends object> {
  constructor(private awareness: Awareness) { }

  getStates(): Map<number, T> {
    return this.awareness.getStates() as Map<number, T>; // TODO: filter out null states
  }

  getLocalState(): T | null {
    return this.awareness.getLocalState() as T | null;
  }

  setLocalState(state: T) {
    this.awareness.setLocalState(state);
  }

  setLocalStateField<K extends keyof T>(
    key: K,
    value: T[K]
  ) {
    this.awareness.setLocalStateField(key as string, value);
  }

  get clientID() {
    return this.awareness.clientID;
  }
}