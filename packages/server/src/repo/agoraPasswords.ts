import { getRowById, upsertRow } from '../util/dbHelpers.ts';
import { type AgoraPasswordsRow } from '../auth/models.ts';

export const getAgoraPasswordsRow = (id: string) =>
  getRowById<AgoraPasswordsRow>('agora_passwords', id);

export const setAgoraPasswordsRow = (row: AgoraPasswordsRow) =>
  upsertRow<AgoraPasswordsRow>('agora_passwords', row);
