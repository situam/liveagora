import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AccessRole {
  canRead: boolean;
  canEdit: boolean;
}

export const AccessRoles: Record<string, AccessRole> = {
  Viewer: {
    canRead: true,
    canEdit: false,
  },
  Editor: {
    canRead: true,
    canEdit: true,
  },
};

// Default role and auth scope
const defaultRole = AccessRoles.Viewer;
const defaultAuthScope = AccessRoles.Viewer;

// Define the context value type
interface AccessControlContextType {
  currentRole: AccessRole;
  setCurrentRole: (role: AccessRole) => void;
  authScope: AccessRole;
  setAuthScope: (scope: AccessRole) => void;
}

// Create the context with a default value
const AgoraAccessControlContext = createContext<AccessControlContextType | undefined>(undefined);
const SpaceAccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

// Define the provider props
interface AccessControlProviderProps {
  initialRole?: AccessRole;
  initialAuthScope?: AccessRole;
  children: ReactNode;
}

// Shared implementation for both providers
function AccessControlProviderImpl({
  initialRole = defaultRole,
  initialAuthScope = defaultAuthScope,
  children,
  Context,
}: AccessControlProviderProps & { Context: React.Context<AccessControlContextType | undefined> }) {
  const [currentRole, setCurrentRole] = useState<AccessRole>(initialRole);
  const [authScope, setAuthScope] = useState<AccessRole>(initialAuthScope);

  return (
    <Context.Provider value={{ currentRole, setCurrentRole, authScope, setAuthScope }}>
      {children}
    </Context.Provider>
  );
}

// Agora-level provider
export const AgoraAccessControlProvider = (props: AccessControlProviderProps) => (
  <AccessControlProviderImpl {...props} Context={AgoraAccessControlContext} />
);

// Space-level provider
export const SpaceAccessControlProvider = (props: AccessControlProviderProps) => (
  <AccessControlProviderImpl {...props} Context={SpaceAccessControlContext} />
);

// Custom hooks
export const useAgoraAccessControl = (): AccessControlContextType => {
  const context = useContext(AgoraAccessControlContext);
  if (!context) {
    throw new Error('useAgoraAccessControl must be used within an AgoraAccessControlProvider');
  }
  return context;
};

export const useSpaceAccessControl = (): AccessControlContextType => {
  const context = useContext(SpaceAccessControlContext);
  if (!context) {
    throw new Error('useSpaceAccessControl must be used within a SpaceAccessControlProvider');
  }
  return context;
};

// Dev view for either context
export const AccessControlDevView = ({ space }: { space?: boolean }) => {
  const spaceAccessControl = useSpaceAccessControl();
  const agoraAccessControl = useAgoraAccessControl();
  return (
    <pre>
      agoraAccessControl.currentRole: {JSON.stringify(agoraAccessControl.currentRole)}, agoraAccessControl.authScope: {JSON.stringify(agoraAccessControl.authScope)}<br />
      spaceAccessControl.currentRole: {JSON.stringify(spaceAccessControl.currentRole)}, spaceAccessControl.authScope: {JSON.stringify(spaceAccessControl.authScope)}<br />
    </pre>
  );
};