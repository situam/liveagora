import { AgoraPasswordsRow } from '@liveagora/common'
import { client } from './client'

async function getAgoras(token: string) {
  const res = await client.api.admin.agoras.$get({}, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

async function putAgora(token: string, row: AgoraPasswordsRow) {
  const res = await client.api.admin.agoras.$put({
    json: row,
  },{
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

async function deleteAgora(token: string, id: string) {
  const res = await client.api.admin.agoras[':id'].$delete({
    param: {
      id
    }
  },{
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

export {
  getAgoras,
  putAgora,
  deleteAgora
}