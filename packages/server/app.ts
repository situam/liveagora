import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'
import { AuthenticationExtension } from './AuthenticationExtension.ts';

const server = new Server({
  port: 3001,
  extensions: [
    new SQLite({
      database: 'db.sqlite',
    }),
    new Logger(),
    new AuthenticationExtension(),
  ],
  async onConnect({ connectionConfig, socketId, documentName, context }) {
    console.log("[onConnect] connectionConfig", connectionConfig, socketId, documentName, context)
  },
})

server.listen()