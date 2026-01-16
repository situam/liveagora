import { hc } from 'hono/client'
import type { AdminAppType } from '@liveagora/server/src/routes/admin/admin.index.ts'
import { Env } from '../../config/env'

const client = hc<AdminAppType>(Env.serverUrl)
export const apiClient = client[Env.apiBase]