import { AgoraId, AgoraPasswordsRow } from '@liveagora/common'
import { apiClient } from './client'
import { basicAuthHeader } from '../util'

async function getAgoras(token: string) {
  const res = await apiClient.admin.agoras.$get({}, {
    headers: { Authorization: basicAuthHeader('admin', token) },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

async function createAgora(token: string, agoraId: AgoraId) {
  const res = await apiClient.admin.agoras[':agoraId'].$post({
    param: {
      agoraId
    }
  },{
    headers: { Authorization: basicAuthHeader('admin', token) },
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
  const res = await apiClient.admin.agoras[':agoraId'].$put({
    param: {
      agoraId: req.id
    },
    json: req.row,
  },{
    headers: { Authorization: basicAuthHeader('admin', token) },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

async function deleteAgora(token: string, agoraId: AgoraId) {
  const res = await apiClient.admin.agoras[':agoraId'].$delete({
    param: {
      agoraId
    }
  },{
    headers: { Authorization: basicAuthHeader('admin', token) },
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