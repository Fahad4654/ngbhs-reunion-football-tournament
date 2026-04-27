'use client';

import { useState, ReactNode } from 'react';
import Sidebar from '@/app/components/Sidebar';
import PanelNavbar from '@/app/components/panel/PanelNavbar';
import type { AppUser } from '@/lib/server-auth';

interface PanelShellProps {
  children: ReactNode;
  user: AppUser;
}

export default function PanelShell({ children, user }: PanelShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Desktop Sidebar - Natural Flex */}
      <div className="sidebar-desktop" style={{ 
        width: '280px',
        minWidth: '280px',
        maxWidth: '280px',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1500,
            cursor: 'pointer'
          }}
        />
      )}

      {/* Mobile Sidebar - Drawer Style */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isSidebarOpen ? 0 : '-300px',
          display: isSidebarOpen ? 'block' : 'none',
          width: '280px',
          zIndex: 1600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(10, 11, 13, 0.98)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: isSidebarOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <Sidebar user={user} onClose={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0,
        position: 'relative'
      }}>
        <div style={{ minHeight: '70px' }}>
          <PanelNavbar userName={user.name} userImage={user.image} onMenuClick={toggleSidebar} />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="panel-main-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
