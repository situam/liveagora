import { getRowById, getRowsByIdPrefix, upsertRow } from '../util/dbHelpers.ts';
import { DocumentNames, type SpacePasswordsRow } from '@liveagora/common';

export const getSpacePasswordRowsByAgora = (agoraId: string) => {
  const prefix = DocumentNames.buildSpaceDocPrefix(
    DocumentNames.getAgoraNameFromDocName(agoraId)
  );

  return getRowsByIdPrefix<SpacePasswordsRow>('space_passwords', prefix);
}  

export const getSpacePasswordsRow = (id: string) =>
  getRowById<SpacePasswordsRow>('space_passwords', id);

export const setSpacePasswordsRow = (row: SpacePasswordsRow) =>
  upsertRow<SpacePasswordsRow>('space_passwords', row);
