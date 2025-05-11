import React, { createContext, useContext, useState, ReactNode } from 'react';

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


// Default role and auth scope
const defaultRole = AccessRoles.Viewer;
const defaultAuthScope = AccessRoles.Viewer;

// Define the context value type
interface AccessControlContextType {
  currentRole: AccessRole;
  // set currentRole by AccessRole.id or AccessRole
  setCurrentRole: (role: AccessRole | string) => void;
  authScope: AccessRole;
  // set authScope by AccessRole.id or AccessRole
  setAuthScope: (scope: AccessRole | string) => void;
}

// Create the context with a default value
const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

// Define the provider props
interface AccessControlProviderProps {
  initialRole?: AccessRole;
  initialAuthScope?: AccessRole;
  children: ReactNode;
}

// AccessControlProvider component
export const AccessControlProvider = ({
  initialRole = defaultRole,
  initialAuthScope = defaultAuthScope,
  children,
}: AccessControlProviderProps) => {
  const [currentRole, setCurrentRoleState] = useState<AccessRole>(initialRole);
  const [authScope, setAuthScopeState] = useState<AccessRole>(initialAuthScope);

  const setAccessRoleState = (
    value: AccessRole | string,
    setState: React.Dispatch<React.SetStateAction<AccessRole>>
  ) => {
    if (typeof value === 'string') {
      const matchingRole = Object.values(AccessRoles).find(role => role.id === value);
      if (matchingRole) {
        setState(matchingRole);
        return;
      }
    } else if (Object.values(AccessRoles).includes(value)) {
      setState(value);
      return;
    }

    console.error(`Invalid AccessRole value provided`, value);
  };

  const setCurrentRole = (role: AccessRole | string) => {
    setAccessRoleState(role, setCurrentRoleState);
  };

  const setAuthScope = (scope: AccessRole | string) => {
    setAccessRoleState(scope, setAuthScopeState);
  };

  return (
    <AccessControlContext.Provider value={{ currentRole, setCurrentRole, authScope, setAuthScope }}>
      {children}
    </AccessControlContext.Provider>
  );
};

// Custom hook for accessing the context
export const useAccessControl = (): AccessControlContextType => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

// Development view for debugging
export const AccessControlDevView = () => {
  const { currentRole, authScope } = useAccessControl();
  return (
    <pre>
      currentRole: {currentRole.id}, authScope: {authScope.id}
    </pre>
  );
};