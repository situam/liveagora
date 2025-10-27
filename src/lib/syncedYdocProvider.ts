import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { MiniStatelessRPC } from "../rpc";
import { Awareness } from "y-protocols/awareness.js";
import { AccessRole } from "../context/AccessControlContext";

type SyncedYdocProviderConfig = {
  debug?: boolean;

  ydoc: Y.Doc;
  documentName: string;
  url: string;
  token: string;

  onSynced?: () => void;
  onAuthenticated?: (authorizedScope: string) => void;
  onAuthenticationFailed?: () => void;
  onAccessRole?: (accessRole: AccessRole) => void;
}

class SyncedYdocProvider {
  config: SyncedYdocProviderConfig

  private provider: HocuspocusProvider | null = null
  private rpc: MiniStatelessRPC | null = null

  constructor(config: SyncedYdocProviderConfig) {
    this.config = config;
    this.log("constructor", config)
  }

  get _debugTag() {
    return `[SyncedYdocProvider:${this.config.documentName}]`
  }

  log(...args: any[]) {
    if (this.config.debug !== false) {
      console.log(this._debugTag, ...args);
    }
  }

  /**
   * Initialize and connects a HocuspocusProvider to the Yjs document.
   * @param token - optional (if not provided, the token in the config will be used)
   * @returns {Promise<void>} a promise that resolves when the provider is initialized,
   * or rejects if the authentication fails
   */
  async initProvider(token?: string): Promise<void> {
    const tokenToUse = token ?? this.config.token
    this.log("initProvider", tokenToUse)

    if (this.provider !== null) {
      this.log("initProvider: already connected, canEdit:", this.canEdit)
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      this.provider = new HocuspocusProvider({
        token: tokenToUse,
        url: this.config.url,
        name: this.config.documentName,
        document: this.config.ydoc,
        onAuthenticated: () => {
          this.log("onAuthenticated, scope:", this.provider!.authorizedScope)
          if (this.config.onAuthenticated)
            this.config.onAuthenticated!(this.provider!.authorizedScope!)
          /**
           * In case the password worked, update the token in the provider
           */
          this.setToken(tokenToUse)
          resolve();
        },
        onAuthenticationFailed: (data) => {
          this.log("onAuthenticationFailed", data)
          if (this.config.onAuthenticationFailed)
            this.config.onAuthenticationFailed!()
          this.provider!.destroy()
          reject(new Error("Authentication failed"));
        },
        onOpen: (data) => this.log("onOpen", data),
        onClose: (data) => this.log("onClose", data),
        onSynced: () => {
          this.log("onSynced")
          if (this.config.onSynced)
            this.config.onSynced!()
        },
        //onMessage: (data) => this.log("onMessage", data),
        //onOutgoingMessage: (data) => this.log("onOutgoingMessage", data),
        onConnect: () => this.log("onConnect"),
        onDisconnect: () => this.log("onDisconnect"),
        onDestroy: () => {
          this.log("onDestroy")
          this.provider = null
          this.rpc = null
        },
        onStateless: (data) => {
          this.log("onStateless", data)
          try {
            const rpcBody = JSON.parse(data?.payload)
            if (this.rpc!.receiveMessageObject(rpcBody)) {
              this.log("RPC handled message", rpcBody)
              return;
            }

            switch (rpcBody.type) {
              case 'authorizedScope':
                this.log("received authorizedScope, setting...", rpcBody.scope)
                this.provider!.authorizedScope = rpcBody.scope

                // callback
                if (this.config.onAccessRole)
                  this.config.onAccessRole(this.authScope)  

                break;

              default:
                this.log("unhandled type", rpcBody.type)
            }

          } catch (e) {
            console.error(this._debugTag, "onStateless error", e);
          }
        }
      });
      this.rpc = new MiniStatelessRPC(this.provider);
    })
  }

  async requestEditAccess(token: string): Promise<boolean> {
    this.log("requestEditAccess", token)

    if (this.rpc === null || this.provider === null) {
      throw new Error("RPC is not initialized")
    }

    let { success } = await this.rpc!.send("requestEditAccess", {
      password: token
    })
    if (success) {
      this.setToken(token)
    }
    return success === true
  }

  setToken(token: string) {
    this.config.token = token
    this.provider!.configuration.token = token
  }

  get canRead(): boolean {
    return this.provider?.authorizedScope?.includes("read") ?? false;
  }

  get canEdit(): boolean {
    return this.provider?.authorizedScope?.includes("write") ?? false;
  }

  get authScope(): AccessRole {
    return {
      canRead: this.canRead,
      canEdit: this.canEdit
    }
  }

  get awareness(): Awareness | null {
    return this.provider?.awareness ?? null;
  }

  destroy() {
    this.log("destroy")
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
  }
}

export {
  SyncedYdocProvider,
  SyncedYdocProviderConfig
}