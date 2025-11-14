import { Hocuspocus } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'
import { env } from '../env.ts'
import { AuthenticationExtension } from './AuthenticationExtension/AuthenticationExtension.ts'

export const hocuspocus = new Hocuspocus({
  extensions: [
    new SQLite({
      database: env.pathToDb,
    }),
    new Logger(),
    new AuthenticationExtension({
      database: env.pathToDb,
    }),
  ],
  async onConnect({ connectionConfig, socketId, documentName, context }) {
    console.log("[onConnect] connectionConfig", connectionConfig, socketId, documentName, context)
  },
})