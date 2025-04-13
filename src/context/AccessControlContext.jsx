import React, { createContext, useContext, useState } from 'react';

/**
 * Defines the structure for access control settings based on user roles.
 * @typedef {Object} AccessRole
 * @property {string} label - name of the role
 * @property {boolean} canRead - Indicates if the role can read content.
 * @property {boolean} canEdit - Indicates if the role can edit content.
 * @property {boolean} canManage - Indicates if the role has management permissions, including structural changes and user permissions.
 * @property {string} description - A brief description of the role and its capabilities.
 */

/**
 * 
 * @param {String} str 
 * @returns {AccessRole}
 */
export function convertStringToAccessRole(str) {
  switch (str) {
    case 'owner':
      return AccessRoles.Owner;
    case 'editor':
      return AccessRoles.Editor;
    case 'viewer':
      return AccessRoles.Viewer;
    default:
      throw("convertStringToAccessRole: unhandled", str);
  }
}

/**
 * Access roles definitions.
 */
const AccessRoles = {
  Viewer: {
    canRead: true,
    canEdit: false,
    canManage: false,
    description: "Read-only access to content.",
    label: "AccessRole.Viewer"
  },
  Editor: {
    canRead: true,
    canEdit: true,
    canManage: false,
    description: "Can edit content but cannot manage the overall settings or structures.",
    label: "AccessRole.Editor"
  },
  Owner: {
    canRead: true,
    canEdit: true,
    canManage: true,
    description: "Full control over content and settings, including user roles and permissions.",
    label: "AccessRole.Owner"
  },
};

/** Default role for new users or sessions. */
const defaultRole = AccessRoles.Viewer;

/** Default auth scope for new users or sessions. */
const defaultAuthScope = AccessRoles.Viewer;

/** Context for managing and accessing user roles and permissions. */
const AccessControlContext = createContext({
  currentRole: defaultRole,
  setCurrentRole: () => {}, // Placeholder function for initial context value.
});

/**
 * Provides a context for access control, allowing child components to manage and understand their access level.
 * @param {Object} props - The component props.
 * @param {AccessRole} [props.initialRole=defaultRole] 
 * @param {AccessRole} [props.initialAuthScope=defaultAuthsScope] 
 * @param {React.ReactNode} props.children - The child components that require access control.
 */
const AccessControlProvider = ({ initialRole = defaultRole, initialAuthScope = defaultAuthScope, children }) => {
  /**
   * the current client-side role (determines view mode)
   */
  const [currentRole, setCurrentRole] = useState(initialRole);

  /**
   * the max auth scope granted by the server
   */
  const [authScope, setAuthScope] = useState(initialAuthScope);

  return (
    <AccessControlContext.Provider value={{ currentRole, setCurrentRole, authScope, setAuthScope }}>
      {children}
    </AccessControlContext.Provider>
  );
};

/**
 * Custom hook for accessing and updating the current user's role and permissions.
 */
const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

const AccessControlDevView = () => {
  const { currentRole, authScope } = useAccessControl()
  return <pre>
    currentRole: {currentRole.label}, authScope: {authScope.label}
  </pre>
}

export { AccessControlProvider, useAccessControl, AccessRoles, AccessControlDevView };