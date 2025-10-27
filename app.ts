import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'
import { canRead, handleRequestEditAccessRPC, notifyClientOfAuthorizedScope } from './auth.ts'
import { initializeDatabase } from './db.ts';

// TODO: refactor (do this in i.e. auth extension)
initializeDatabase();

const server = new Server({
  port: 3001,
  extensions: [
    new SQLite({
      database: 'db.sqlite',
    }),
    new Logger(),
  ],
  /*async beforeHandleMessage(data) {
    console.log("beforeHandleMessage, connection.readOnly:", data.connection.readOnly)
  },*/
  async onConnect({ connectionConfig, socketId, documentName, context }) {
    console.log("[onConnect] connectionConfig", connectionConfig, socketId, documentName, context)
  },
  async connected(data) {
    console.log('[connected]', data.socketId, data.documentName, data.connectionConfig, data.context)

    notifyClientOfAuthorizedScope(data.connection, data.connectionConfig.readOnly)
  },
  async onAuthenticate(data) {
    const { token, documentName, connectionConfig } = data
    console.log(`[onAuthenticate] documentName: ${documentName}, token: ${token}, socketId: ${data.socketId}`)

    if (!await canRead(token, documentName)) {
      throw new Error('Authentication failed: cannot read document')
    }

    // always start as readOnly - client can request edit access later
    connectionConfig.readOnly = true
  },
  async onStateless({ payload, documentName, connection }) {
    console.log(`[onStateless] "${payload}", socketId: ${connection.socketId}, documentName: ${documentName}`)
 
    try {
      handleRequestEditAccessRPC(connection, documentName, payload)
    } catch (e) {
      console.error("[onStateless] error", payload, e)
    }
  },
})

server.listen()