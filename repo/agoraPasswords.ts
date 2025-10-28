import { getRowById, upsertRow } from '../dbHelpers.ts';
import { type AgoraPasswordsRow } from '../models.ts';

export const getAgoraPasswordsRow = (id: string) =>
  getRowById<AgoraPasswordsRow>('agora_passwords', id);

export const setAgoraPasswordsRow = (row: AgoraPasswordsRow) =>
  upsertRow<AgoraPasswordsRow>('agora_passwords', row);
