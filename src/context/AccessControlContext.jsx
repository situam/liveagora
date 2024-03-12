import React, { createContext, useContext, useState } from 'react';

/**
 * Defines the structure for access control settings based on user roles.
 * @typedef {Object} AccessRole
 * @property {boolean} canRead - Indicates if the role can read content.
 * @property {boolean} canEdit - Indicates if the role can edit content.
 * @property {boolean} canManage - Indicates if the role has management permissions, including structural changes and user permissions.
 * @property {string} description - A brief description of the role and its capabilities.
 */

/**
 * Access roles definitions.
 */
const AccessRoles = {
  Viewer: {
    canRead: true,
    canEdit: false,
    canManage: false,
    description: "Read-only access to content.",
  },
  Editor: {
    canRead: true,
    canEdit: true,
    canManage: false,
    description: "Can edit content but cannot manage the overall settings or structures.",
  },
  Owner: {
    canRead: true,
    canEdit: true,
    canManage: true,
    description: "Full control over content and settings, including user roles and permissions.",
  },
};

/** Default role for new users or sessions. */
const defaultRole = AccessRoles.Viewer;

/** Context for managing and accessing user roles and permissions. */
const AccessControlContext = createContext({
  currentRole: defaultRole,
  setCurrentRole: () => {}, // Placeholder function for initial context value.
});

/**
 * Provides a context for access control, allowing child components to manage and understand their access level.
 * @param {Object} props - The component props.
 * @param {AccessRole} [props.role=defaultRole] - The initial user role.
 * @param {React.ReactNode} props.children - The child components that require access control.
 */
const AccessControlProvider = ({ role = defaultRole, children }) => {
  const [currentRole, setCurrentRole] = useState(role);

  return (
    <AccessControlContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </AccessControlContext.Provider>
  );
};

/**
 * Custom hook for accessing and updating the current user's role and permissions.
 * @returns {{
 *  currentRole: AccessRole,
 *  setCurrentRole: React.Dispatch<React.SetStateAction<AccessRole>>
 * }} The current user role and a function to update it.
 */
const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

export { AccessControlProvider, useAccessControl, AccessRoles };
