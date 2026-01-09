import { hc } from 'hono/client'
import type { ApiType } from '@liveagora/server/src/routes/admin/admin.index.ts'
import { Env } from '../../config/env'

const client = hc<ApiType>(Env.serverUrl)
export const apiClient = client[Env.apiBase]