'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import PublicIcon from '@mui/icons-material/Public';
import NotificationBell from '../NotificationBell';

const PAGE_INFO: Record<string, { badge: string; title: string }> = {
  '/dashboard/posts/my-posts': { badge: 'My Content', title: 'Your Posts' },
  '/dashboard/posts': { badge: 'Create Post', title: 'Community Sharing' },
  '/dashboard/batch-feed': { badge: 'Batch Activity', title: 'Batch Feed' },
  '/dashboard/manage-batch': { badge: 'Moderation', title: 'Manage Batch' },
  '/dashboard/team-management': { badge: 'Team', title: 'Team Management' },
  '/dashboard/members': { badge: 'Community', title: 'Member Directory' },
  '/dashboard/scores': { badge: 'Tournament', title: 'Update Scores' },
  '/dashboard': { badge: 'Overview', title: 'Overview' },
  '/dashboard/news': { badge: 'News Manager', title: 'Latest Updates' },
  '/admin/batches': { badge: 'Batches', title: 'Batch Standings' },
  '/admin/matches': { badge: 'Matches', title: 'Tournament Schedule' },
  '/admin/news': { badge: 'News Manager', title: 'Latest Updates' },
  '/admin/posts': { badge: 'Post Moderation', title: 'User Posts' },
  '/admin/users': { badge: 'Users', title: 'Access Control' },
  '/admin/tournaments': { badge: 'Events', title: 'Tournaments' },
  '/admin': { badge: 'System', title: 'Admin Dashboard' },
  '/profile': { badge: 'Account Settings', title: 'Your Profile' },
};

interface PanelNavbarProps {
  userName: string | null;
  userImage?: string | null;
  userRole?: string;
  onMenuClick?: () => void;
}

export default function PanelNavbar({ userName, userImage, userRole, onMenuClick }: PanelNavbarProps) {
  const pathname = usePathname();
  
  // Find the most specific match first
  const matchingKey = Object.keys(PAGE_INFO)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname === key || pathname.startsWith(key + '/'));
    
  // Fallback for exact dashboard/admin matches if sub-route logic misses
  const finalKey = matchingKey || (Object.keys(PAGE_INFO).find(key => pathname === key));
  
  let info = finalKey ? { ...PAGE_INFO[finalKey] } : { badge: 'Management', title: 'Panel' };

  // Customize label for Batch Managers
  if (userRole === 'BATCH_MANAGER' && (finalKey === '/admin/news' || finalKey === '/dashboard/news')) {
    info.badge = 'Batch News';
  }

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
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <MenuIcon sx={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', color: 'white' }} />
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Link
            href="/feed"
            className="btn glass"
            style={{ 
              fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', 
              padding: '0 0.4rem',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              opacity: 0.8
            }}
          >
            <PublicIcon sx={{ fontSize: '1rem', color: 'var(--accent-primary)' }} />
            <span className="desktop-only" style={{ fontWeight: '700' }}>Community</span>
          </Link>

          <NotificationBell />

          <Link href="/profile" className="btn glass panel-profile-link" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            gap: '0.75rem',
            padding: '0 0.4rem 0 0.8rem',
            height: 'clamp(32px, 9vw, 44px)',
            borderRadius: '100px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <span className="desktop-only" style={{ 
              fontWeight: '800', 
              color: 'var(--accent-primary)', 
              fontSize: '0.8rem',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Outfit, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {userName}
            </span>
            <div
              className="panel-user-avatar"
              style={{
                width: 'calc(clamp(32px, 9vw, 44px) - 10px)',
                height: 'calc(clamp(32px, 9vw, 44px) - 10px)',
                borderRadius: '50%',
                background: userImage ? 'transparent' : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: '900',
                fontSize: 'clamp(0.65rem, 3vw, 0.85rem)',
                overflow: 'hidden',
                border: '1px solid var(--accent-primary)',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
