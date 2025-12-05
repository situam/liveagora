import { getRowById, getRows, upsertRow } from '../util/dbHelpers.ts';
import { type AgoraPasswordsRow } from '@liveagora/common';

export const getAgoraPasswordRows = () =>
  getRows<AgoraPasswordsRow>('agora_passwords');

export const getAgoraPasswordsRow = (id: string) =>
  getRowById<AgoraPasswordsRow>('agora_passwords', id);

export const setAgoraPasswordsRow = (row: AgoraPasswordsRow) =>
  upsertRow<AgoraPasswordsRow>('agora_passwords', row);
