export interface AgoraPasswordsRow {
  id: string;
  read_password: string | null;
  edit_password: string;
}

export interface SpacePasswordsRow {
  id: string;
  // agora_id: string;
  edit_password: string | null;
}