import { hc } from 'hono/client'
import type { AdminAppType } from '@liveagora/server/src/routes/admin/admin.index.ts'
import { Env } from '../../config/env'

export const client = hc<AdminAppType>(Env.serverUrl)