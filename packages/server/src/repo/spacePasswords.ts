import { getRowById, upsertRow } from '../util/dbHelpers.ts';
import { type SpacePasswordsRow } from '../auth/models.ts';

export const getSpacePasswordsRow = (id: string) =>
  getRowById<SpacePasswordsRow>('space_passwords', id);

export const setSpacePasswordsRow = (row: SpacePasswordsRow) =>
  upsertRow<SpacePasswordsRow>('space_passwords', row);
