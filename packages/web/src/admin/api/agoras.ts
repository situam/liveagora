import { AgoraId, AgoraPasswordsRow } from '@liveagora/common'
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

async function createAgora(token: string, agoraId: AgoraId) {
  const res = await client.api.admin.agoras[':agoraId'].$post({
    param: {
      agoraId
    }
  },{
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

type UpdateAgoraInput = {
  id: AgoraId;
  row: Omit<AgoraPasswordsRow, 'id'>;
};
async function updateAgora(token: string, req: UpdateAgoraInput) {
  const res = await client.api.admin.agoras[':agoraId'].$put({
    param: {
      agoraId: req.id
    },
    json: req.row,
  },{
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

async function deleteAgora(token: string, agoraId: AgoraId) {
  const res = await client.api.admin.agoras[':agoraId'].$delete({
    param: {
      agoraId
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
  createAgora,
  updateAgora,
  UpdateAgoraInput,
  deleteAgora
}