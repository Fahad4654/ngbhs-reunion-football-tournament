'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_INFO: Record<string, { badge: string; title: string }> = {
  '/dashboard/posts/my-posts': { badge: 'My Content', title: 'Your Posts' },
  '/dashboard/posts': { badge: 'Create Post', title: 'Community Sharing' },
  '/dashboard/batch-feed': { badge: 'Batch Activity', title: 'Batch Feed' },
  '/dashboard/manage-batch': { badge: 'Moderation', title: 'Manage Batch' },
  '/dashboard/scores': { badge: 'Tournament', title: 'Update Scores' },
  '/dashboard': { badge: 'Overview', title: 'Dashboard Overview' },
  '/dashboard/news': { badge: 'News Manager', title: 'Latest Updates' },
  '/admin/batches': { badge: 'Batches', title: 'Batch Standings' },
  '/admin/matches': { badge: 'Matches', title: 'Tournament Schedule' },
  '/admin/news': { badge: 'Announcements', title: 'News Manager' },
  '/admin/posts': { badge: 'Post Moderation', title: 'User Posts' },
  '/admin/users': { badge: 'Users', title: 'Access Control' },
  '/admin': { badge: 'System', title: 'Admin Dashboard' },
  '/profile': { badge: 'Account Settings', title: 'Your Profile' },
};

interface PanelNavbarProps {
  userName: string | null;
  userImage?: string | null;
  onMenuClick?: () => void;
}

export default function PanelNavbar({ userName, userImage, onMenuClick }: PanelNavbarProps) {
  const pathname = usePathname();
  
  // Find the most specific match first
  const matchingKey = Object.keys(PAGE_INFO)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname === key || pathname.startsWith(key + '/'));
    
  // Fallback for exact dashboard/admin matches if sub-route logic misses
  const finalKey = matchingKey || (Object.keys(PAGE_INFO).find(key => pathname === key));
  
  const info = finalKey ? PAGE_INFO[finalKey] : { badge: 'Management', title: 'Panel' };

  return (
    <nav
      className="glass panel-navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backdropFilter: 'blur(20px)',
        padding: '0 0.75rem'
      }}
    >
      <div className="panel-nav-container" style={{ 
        width: '100%', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          {/* Hamburger Menu - Mobile Only */}
          <button 
            onClick={onMenuClick}
            className="mobile-nav-toggle btn glass"
            style={{ 
              width: 'clamp(32px, 9vw, 44px)', 
              height: 'clamp(32px, 9vw, 44px)', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 'clamp(0.9rem, 4vw, 1.25rem)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            ☰
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minWidth: 0, flex: 1 }}>
            <div className="navbar-badge" style={{ 
              color: 'var(--text-muted)', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)', 
              letterSpacing: '0.05em', 
              lineHeight: 1,
              opacity: 0.7
            }}>
              {info.badge}
            </div>
            <h2 className="navbar-title text-gradient" style={{ 
              margin: 0, 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              fontSize: 'inherit', 
              letterSpacing: '-0.02em', 
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}>
              {info.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <Link
            href="/feed"
            className="btn glass"
            style={{ 
              fontSize: 'clamp(0.7rem, 3vw, 0.875rem)', 
              padding: '0 0.5rem',
              height: 'clamp(32px, 9vw, 44px)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <span style={{ fontSize: 'clamp(0.8rem, 3.5vw, 1.1rem)' }}>🌐</span>
            <span className="desktop-only" style={{ fontWeight: '700' }}>Feed</span>
          </Link>

          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div
              className="panel-user-avatar"
              style={{
                width: 'clamp(32px, 9vw, 44px)',
                height: 'clamp(32px, 9vw, 44px)',
                borderRadius: '8px',
                background: userImage ? 'transparent' : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: '900',
                fontSize: 'clamp(0.75rem, 3.5vw, 1rem)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {userImage ? (
                <img src={userImage} alt={userName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (userName || 'U').charAt(0)
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
