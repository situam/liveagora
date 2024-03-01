
import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
//import { Logger } from '@hocuspocus/extension-logger'
//import { Monitor } from '@hocuspocus/extension-monitor'

const server = Server.configure({
  port: 3000,
  extensions: [
    new SQLite({
      database: './db.sqlite',
    }),
    //new Logger(),
    //new Monitor(),
  ],
  async connected() {
    console.log('connections:', server.getConnectionsCount())
  },
  async onDisconnect() {
    console.log('connections:', server.getConnectionsCount())
  },
})

server.listen()
