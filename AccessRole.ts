// TODO: This file is copied from the frontend
// - should be moved to a shared location

export interface AccessRole {
  id: string;
  canRead: boolean;
  canEdit: boolean;
  canManage: boolean;
}

export const AccessRoles: Record<string, AccessRole> = {
  Viewer: {
    id: "AccessRole.Viewer",
    canRead: true,
    canEdit: false,
    canManage: false,
  },
  Editor: {
    id: "AccessRole.Editor",
    canRead: true,
    canEdit: true,
    canManage: false,
  },
  Owner: {
    id: "AccessRole.Owner",
    canRead: true,
    canEdit: true,
    canManage: true,
  },
};
