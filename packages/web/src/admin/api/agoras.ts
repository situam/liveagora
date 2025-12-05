import { AgoraPasswordsRow } from '@liveagora/common'
import { Env } from '../../config/env'

async function getAgoras(token: string): Promise<AgoraPasswordsRow[]> {
  const res = await fetch(`${Env.serverUrl}/getAgoras`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export {
  getAgoras,
}