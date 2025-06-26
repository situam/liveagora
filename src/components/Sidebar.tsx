import React, { useState, createContext, useContext, ReactNode, CSSProperties } from 'react';

// Types
interface SidebarContextType {
  content: ReactNode | null;
  isOpen: boolean;
  openSidebar: (content: ReactNode | null) => void;
  closeSidebar: () => void;
}

interface SidebarProviderProps {
  children: ReactNode;
}

interface SidebarContentProps {
  showCloseButton?: boolean;
  children: ReactNode;
}

// Context for sidebar state management
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openSidebar = (content: ReactNode): void => {
    console.log("openSidebar called");
    setIsOpen(true);
    setContent(content);
  };

  const closeSidebar = (): void => {
    setIsOpen(false);
    setContent(null)
  };

  const value: SidebarContextType = {
    isOpen,
    content,
    openSidebar,
    closeSidebar
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <SidebarContext.Provider value={value}>
      <div style={{ 
        display: 'flex', 
        height: '100%',
        width: '100vw'
      }}>
        {/* Main content area */}
        <div style={{ 
          flex: 1,
          width: isMobile ? '100vw' : (isOpen ? 'calc(100vw - 350px)' : '100vw'),
          transition: 'width 0.2s ease',
          overflow: 'hidden'
        }}>
          {children}
        </div>
        
        {/* Sidebar space (only on desktop) */}
        {!isMobile && isOpen && (
          <div style={{ width: '350px', flexShrink: 0 }} />
        )}
      </div>
    </SidebarContext.Provider>
  );
};

// Hook to use sidebar
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Component that renders sidebar content in the caller's context
export const SidebarContent: React.FC<SidebarContentProps> = ({ showCloseButton, children }) => {
  const { content, isOpen, closeSidebar } = useSidebar();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  if (!isOpen) return null;
  if (!children) return null;

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: isMobile ? '100vw' : '350px',
    height: '100%',
    backgroundColor: 'var(--theme-background)',
    borderLeft: isMobile ? 'none' : 'var(--ux-stroke-width) solid var(--ux-color-main)',
    zIndex: 99999,
    padding: 'var(--ux-base-font-size)',
    boxSizing: 'border-box',
    overflow: 'auto'
  };

  return (
    <div id="sidebarTest" style={sidebarStyle}>
      {showCloseButton && <button 
        style={{
          position: 'absolute',
          top: '1em',
          right: '1em',
          zIndex: 10000
        }}
        onClick={closeSidebar}
      >
        close
      </button>}
      
      {children}

      {content}
    </div>
  );
};
