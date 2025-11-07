import { getRowById, upsertRow } from '../dbHelpers.ts';
import { type SpacePasswordsRow } from '../models.ts';

export const getSpacePasswordsRow = (id: string) =>
  getRowById<SpacePasswordsRow>('space_passwords', id);

export const setSpacePasswordsRow = (row: SpacePasswordsRow) =>
  upsertRow<SpacePasswordsRow>('space_passwords', row);
