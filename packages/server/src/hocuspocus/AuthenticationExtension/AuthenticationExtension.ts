import type { connectedPayload, Extension, onAuthenticatePayload, onConfigurePayload, onConnectPayload, onStatelessPayload } from "@hocuspocus/server";
import { canRead } from "../../auth/auth.ts";
import { initializeDatabase } from "../../auth/db.ts";
import { handleRequestEditAccessRPC, notifyClientOfAuthorizedScope } from "./helpers.ts";

export class AuthenticationExtensionConfig {
  /**
   * Path to db
   */
  database: string; 
}

export class AuthenticationExtension implements Extension {
  config: AuthenticationExtensionConfig

  constructor(config: AuthenticationExtensionConfig) {
    this.config = config
  }

  async onConfigure(data: onConfigurePayload) {
    console.log("[onConfigure]")
    initializeDatabase(this.config.database)
  }

  async onAuthenticate(data: onAuthenticatePayload) {
    const { token, documentName, connectionConfig } = data
    console.log(`[onAuthenticate] documentName: ${documentName}, token: ${token}, socketId: ${data.socketId}`)

    if (!await canRead(token, documentName)) {
      throw new Error('Authentication failed: cannot read document')
    }

    // always start as readOnly (client can later upgrade scope via RPC)
    connectionConfig.readOnly = true
  }

  async connected(data: connectedPayload) {
    console.log('[connected]', data.socketId, data.documentName, data.connectionConfig, data.context)

    // notify client on auth scope
    notifyClientOfAuthorizedScope(data.connection, data.connectionConfig.readOnly)
  }

  /*
  async beforeHandleMessage(data) {
    console.log("beforeHandleMessage, connection.readOnly:", data.connection.readOnly)
  }
  */

  async onStateless({ payload, documentName, connection }: onStatelessPayload) {
    console.log(`[onStateless] "${payload}", socketId: ${connection.socketId}, documentName: ${documentName}`)

    try {
      handleRequestEditAccessRPC(connection, documentName, payload)
    } catch (e) {
      console.error("[onStateless] error", payload, e)
    }
  }
}