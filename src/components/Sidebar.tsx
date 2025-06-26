import React, { useState, createContext, useContext, ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';

// Types
interface SidebarMetadata {
  [key: string]: any;
}

interface SidebarContextType {
  isOpen: boolean;
  metadata: SidebarMetadata | null;
  openSidebar: (data: SidebarMetadata) => void;
  closeSidebar: () => void;
}

interface SidebarProviderProps {
  children: ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: SidebarMetadata | null;
}

// Context for sidebar state management
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<SidebarMetadata | null>(null);

  const openSidebar = (data: SidebarMetadata): void => {
    setMetadata(data);
    setIsOpen(true);
  };

  const closeSidebar = (): void => {
    setIsOpen(false);
    setMetadata(null);
  };

  const value: SidebarContextType = {
    isOpen,
    metadata,
    openSidebar,
    closeSidebar
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <SidebarContext.Provider value={value}>
      <div style={{ 
        display: 'flex', 
        height: '100vh',
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
      
      <SidebarPortal />
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

// Portal component that renders the sidebar
const SidebarPortal: React.FC = () => {
  const { isOpen, metadata, closeSidebar } = useSidebar();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <Sidebar isOpen={isOpen} onClose={closeSidebar} metadata={metadata} />,
    document.body
  );
};

// Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, metadata }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  if (!isOpen) return null;

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: isMobile ? '100vw' : '350px',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    borderLeft: isMobile ? 'none' : '2px solid rgb(0, 0, 0)',
    zIndex: 9999,
    padding: '24px',
    boxSizing: 'border-box',
    overflow: 'auto'
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <>
      {isMobile && <div style={overlayStyle} onClick={onClose} />}
      
      <div style={sidebarStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e9ecef'
        }}>
          <h3 style={{ margin: 0, color: '#343a40', fontSize: '18px' }}>
            Object Details
          </h3>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6c757d'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {metadata ? (
            Object.entries(metadata).map(([key, value]) => (
              <div key={key}>
                <div style={{
                  fontWeight: '600',
                  color: '#495057',
                  marginBottom: '4px',
                  textTransform: 'capitalize'
                }}>
                  {formatKey(key)}:
                </div>
                <div style={{
                  color: '#6c757d',
                  marginBottom: '16px',
                  wordBreak: 'break-word',
                  backgroundColor: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}>
                  {formatValue(value)}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              color: '#adb5bd', 
              fontStyle: 'italic', 
              textAlign: 'center', 
              marginTop: '40px' 
            }}>
              Select an object to view its details
            </div>
          )}
        </div>
      </div>
    </>
  );
};