import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'
import { checkToken, handleRequestEditAccessRPC, notifyClientOfAccessRole } from './auth.ts'

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
    console.log('connected', data.socketId, data.documentName, data.connectionConfig, data.context)

    notifyClientOfAccessRole(data.connection, data.context.accessRole)
  },
  async onAuthenticate(data) {
    const { token, documentName, connectionConfig } = data
    console.log(`[onAuthenticate] documentName: ${documentName}, token: ${token}, socketId: ${data.socketId}`)

    const accessRole = await checkToken(token, documentName)
    if (!accessRole) {
      throw new Error('Invalid token')
    }

    connectionConfig.readOnly = !accessRole.canEdit

    return {
      accessRole: accessRole,
    }
  },
  async onStateless({ payload, documentName, connection }) {
    console.log(`onStateless "${payload}", socketId: ${connection.socketId}, documentName: ${documentName}`)

    try {
      handleRequestEditAccessRPC(connection, documentName, payload)
    } catch (e) {
      console.error("onStateless error", payload, e)
    }
  },
})

server.listen()