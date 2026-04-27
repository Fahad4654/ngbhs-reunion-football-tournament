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
        minHeight: '8.148vh',
        display: 'flex',
        alignItems: 'center',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        borderBottom: '0.052vw solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(1.111vh)',
      }}
    >
      <div className="panel-nav-container" style={{ 
        width: '100%', 
        padding: '0 1.667vw',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25vw'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          {/* Hamburger Menu - Mobile Only */}
          <button 
            onClick={onMenuClick}
            className="mobile-only btn glass"
            style={{ padding: '0.463vh 0.417vw', minWidth: '4.167vw', height: '4.167vw', fontSize: '1.25vw' }}
          >
            ☰
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0, flex: 1, marginLeft: '0.5rem', width: 0 }}>
            <div className="navbar-badge" style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.15em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info.badge}
            </div>
            <h2 className="navbar-title" style={{ color: 'var(--accent-primary)', margin: 0, fontWeight: '800', textTransform: 'uppercase', fontSize: '1.25rem', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
          <Link
            href="/feed"
            className="btn glass panel-nav-btn"
            style={{ fontSize: '1.0vw', padding: '0.694vh 1.042vw' }}
          >
            <span className="desktop-only">🌐 Community Feed</span>
            <span className="mobile-only">🌐</span>
          </Link>

          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div
              style={{
                width: '1.667vw',
                height: '1.667vw',
                borderRadius: '50%',
                background: userImage ? 'transparent' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: '800',
                fontSize: '0.833vw',
                overflow: 'hidden',
                border: '0.104vw solid var(--border-color)',
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
