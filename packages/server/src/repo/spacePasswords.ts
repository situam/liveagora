import { deleteRowById, getRowById, getRowsByIdPrefix, upsertRow } from '../util/dbHelpers.ts';
import { DocumentNames, type SpacePasswordsRow } from '@liveagora/common';

export const getSpacePasswordRowsByAgora = (agoraId: string) => {
  const rowIdPrefix = DocumentNames.buildSpaceDocPrefix(agoraId)
  return getRowsByIdPrefix<SpacePasswordsRow>('space_passwords', rowIdPrefix)
}  

export const getSpacePasswordsRow = (agoraId: string, spaceId: string) => {
  const rowId = DocumentNames.buildSpaceDoc(agoraId, spaceId)
  return getRowById<SpacePasswordsRow>('space_passwords', rowId)
}

export const setSpacePasswordsRow = (row: SpacePasswordsRow) =>
  upsertRow<SpacePasswordsRow>('space_passwords', row);

export const deleteSpacePasswordsRow = (agoraId: string, spaceId: string) => {
  const rowId = DocumentNames.buildSpaceDoc(agoraId, spaceId)
  return deleteRowById('space_passwords', rowId)
}
  