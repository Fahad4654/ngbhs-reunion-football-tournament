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
      className="glass"
      style={{
        minHeight: '70px',
        display: 'flex',
        alignItems: 'center',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="panel-nav-container" style={{ 
        width: '100%', 
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          {/* Hamburger Menu - Mobile Only */}
          <button 
            onClick={onMenuClick}
            className="mobile-only btn glass"
            style={{ padding: '0.5rem', minWidth: '40px', height: '40px' }}
          >
            ☰
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0, flex: 1, marginLeft: '0.25rem', width: 0 }}>
            <div className="navbar-badge" style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info.badge}
            </div>
            <h2 className="navbar-title" style={{ color: 'var(--accent-primary)', margin: 0, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
          <Link
            href="/feed"
            className="btn glass panel-nav-btn"
            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          >
            <span className="desktop-only">🌐 Community Feed</span>
            <span className="mobile-only">🌐</span>
          </Link>

          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: userImage ? 'transparent' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: '800',
                fontSize: '0.8rem',
                overflow: 'hidden',
                border: '2px solid var(--border-color)',
                flexShrink: 0
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
