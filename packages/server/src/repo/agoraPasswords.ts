import { deleteRowById, getRowById, getRows, upsertRow } from '../util/dbHelpers.ts';
import { DocumentNames, type AgoraPasswordsRow } from '@liveagora/common';

export const getAgoraPasswordRows = () =>
  getRows<AgoraPasswordsRow>('agora_passwords', 'id');

export const getAgoraPasswordsRow = (agoraId: string) => {
  const rowId = DocumentNames.buildAgoraDoc(agoraId)
  return getRowById<AgoraPasswordsRow>('agora_passwords', rowId)
} 

export const setAgoraPasswordsRow = (row: AgoraPasswordsRow) =>
  upsertRow<AgoraPasswordsRow>('agora_passwords', row);

export const deleteAgoraPasswordsRow = (agoraId: string) => {
  const rowId = DocumentNames.buildAgoraDoc(agoraId)
  return deleteRowById('agora_passwords', rowId)
}
  