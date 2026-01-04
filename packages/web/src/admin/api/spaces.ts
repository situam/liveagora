import { AgoraId, SpaceId, SpacePasswordsRow } from '@liveagora/common'
import { client } from './client'
import { basicAuthHeader } from '../util'

async function getSpacePasswords(agoraId: string, agoraToken: string): Promise<SpacePasswordsRow[]> {
  const res = await client.api.admin.agoras[':agoraId'].spaces.$get({
    param: {
      agoraId,
    },
  }, {
    headers: { Authorization: basicAuthHeader(agoraId, agoraToken) },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

type PutSpacePasswordData = {
  agoraId: AgoraId,
  spaceId: SpaceId,
  row: Omit<SpacePasswordsRow, 'id'>;
};
async function putSpacePassword(agoraToken: string, req: PutSpacePasswordData) {
  const res = await client.api.admin.agoras[':agoraId'].spaces[':spaceId'].$put({
    param: {
      agoraId: req.agoraId,
      spaceId: req.spaceId,
    },
    json: req.row,
  },{
    headers: { Authorization: basicAuthHeader(req.agoraId, agoraToken) },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

async function deleteSpacePassword(agoraId: string, spaceId: SpaceId, agoraToken: string) {
  const res = await client.api.admin.agoras[':agoraId'].spaces[':spaceId'].$delete({
    param: {
      agoraId,
      spaceId
    },
  },{
    headers: { Authorization: basicAuthHeader(agoraId, agoraToken) },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}

export {
  getSpacePasswords,
  PutSpacePasswordData,
  putSpacePassword,
  deleteSpacePassword,
}