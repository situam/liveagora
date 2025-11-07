export class Deferred<T = void> {
  private _promise: Promise<T>
  private _resolve!: (value: T | PromiseLike<T>) => void
  private _reject!: (reason?: any) => void
  private _isResolved = false

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  get promise(): Promise<T> {
    return this._promise
  }

  resolve(value?: T) {
    if (!this._isResolved) {
      this._isResolved = true
      this._resolve(value!)
    }
  }

  reject(reason?: any) {
    if (!this._isResolved) {
      this._isResolved = true
      this._reject(reason)
    }
  }

  reset() {
    if (!this._isResolved) return
    this._isResolved = false
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  get done(): boolean {
    return this._isResolved
  }
}
