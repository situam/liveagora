import { Hocuspocus } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'
import { AuthenticationExtension } from './AuthenticationExtension.ts'
import { env } from '../env.ts'

export const hocuspocus = new Hocuspocus({
  extensions: [
    new SQLite({
      database: env.pathToDb,
    }),
    new Logger(),
    new AuthenticationExtension(),
  ],
  async onConnect({ connectionConfig, socketId, documentName, context }) {
    console.log("[onConnect] connectionConfig", connectionConfig, socketId, documentName, context)
  },
})