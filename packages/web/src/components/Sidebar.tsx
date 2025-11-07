import React, { useState, createContext, useContext, ReactNode, CSSProperties } from 'react';
import { isMobile } from '../util/isMobile';

const _sidebarWidth = '350px'
const _sidebarTopOffset = '125px' // TODO! make this dynamic according to header height

export enum SidebarSide {
  left,
  right
}

interface SidebarData {
  children: ReactNode;
  side: SidebarSide;
  showCloseButton: boolean;
}

interface SidebarContextType {
  openSidebar: (data: SidebarData) => void;
  closeSidebar: () => void;
  data: SidebarData | null;
}

interface SidebarProviderProps {
  children: ReactNode;
}

interface SidebarViewProps extends SidebarData {
  closeSidebar: () => void;
}

// Context for sidebar state management
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [data, setData] = useState<SidebarData | null>(null);

  const openSidebar = (data: SidebarData): void => {
    setData(data);
    document.getElementById("sidebar-hr")?.classList.add("visible");
  };

  const closeSidebar = (): void => {
    setData(null);
    document.getElementById("sidebar-hr")?.classList.remove("visible");
  };

  const value: SidebarContextType = {
    openSidebar,
    closeSidebar,
    data
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const _mainContentSideOffset = (!isMobile && data!=null) ? _sidebarWidth : '0';
  const sideSpecificStyle = data?.side === SidebarSide.left
    ? { left: _mainContentSideOffset }
    : { right: _mainContentSideOffset }
  
  return (
    <SidebarContext.Provider value={value}>
      <div style={{ 
        display: 'flex', 
        height: '100%',
        width: '100vw'
      }}>
        {/* Main content area */}
        <div style={{ 
          position: 'fixed',
          width: isMobile ? '100%' : (data!=null ? `calc(100% - ${_sidebarWidth})` : '100%'),
          height: '100%',
          top: 0,
          ...sideSpecificStyle
        }}>
          {children}
        </div>
        
        {/* Sidebar space (only on desktop) */}
        {!isMobile && data!=null && (
          <div style={{ width: _sidebarWidth, flexShrink: 0 }} />
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

export const SidebarView: React.FC<SidebarViewProps> = ({side, showCloseButton, closeSidebar, ...props}) => {
  const mobile = isMobile();
  const _border = isMobile() ? 'none' : 'var(--ux-stroke-width) solid var(--ux-color-main)'
  const sideSpecificStyle: CSSProperties = side === SidebarSide.left ? {
    left: 0,
    borderRight: _border
  } : {
    right: 0,
    borderLeft: _border,
  }

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    top: _sidebarTopOffset,
    width: mobile ? '100vw' : _sidebarWidth,
    height: `calc(100% - ${_sidebarTopOffset} - var(--ux-base-font-size))`,
    backgroundColor: 'var(--theme-background)',
    zIndex: 99999,
    padding: 'var(--ux-base-font-size)',
    boxSizing: 'border-box',
    overflow: 'auto',
    ...sideSpecificStyle
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
      
      {props.children}
    </div>
  );
}

// Component that renders sidebar content in the caller's context
export const SidebarContent = () => {
  const { data, closeSidebar } = useSidebar();
  
  if (!data) return null;

  return <SidebarView side={data.side} showCloseButton={data.showCloseButton} closeSidebar={closeSidebar}>
    {data.children}
  </SidebarView>
};