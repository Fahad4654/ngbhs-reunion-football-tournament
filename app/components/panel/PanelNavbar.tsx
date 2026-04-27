'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_INFO: Record<string, { badge: string; title: string }> = {
  '/dashboard': { badge: 'Overview', title: 'Dashboard Overview' },
  '/dashboard/posts': { badge: 'Create Post', title: 'Community Sharing' },
  '/dashboard/posts/my-posts': { badge: 'My Posts', title: 'Your Content' },
  '/dashboard/batch-feed': { badge: 'Batch Feed', title: 'Our Activity' },
  '/dashboard/manage-batch': { badge: 'Manage Batch', title: 'Batch Moderation' },
  '/dashboard/scores': { badge: 'Live Scores', title: 'Update Results' },
  '/admin': { badge: 'System Overview', title: 'Admin Dashboard' },
  '/admin/batches': { badge: 'Batch Settings', title: 'Batch Standings' },
  '/admin/matches': { badge: 'Tournament Matches', title: 'Match Schedule' },
  '/admin/news': { badge: 'News Manager', title: 'Tournament News' },
  '/admin/posts': { badge: 'Post Moderation', title: 'User Posts' },
  '/admin/users': { badge: 'User Management', title: 'Access Control' },
};

interface PanelNavbarProps {
  userName: string | null;
}

export default function PanelNavbar({ userName }: PanelNavbarProps) {
  const pathname = usePathname();
  
  const matchingKey = Object.keys(PAGE_INFO)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname.startsWith(key));
    
  const info = matchingKey ? PAGE_INFO[matchingKey] : { badge: 'Management', title: 'Panel' };

  return (
    <nav
      className="glass"
      style={{
        height: '84px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {info.badge}
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', margin: 0, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {info.title}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href="/feed"
            className="btn glass"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            🌐 Community Feed
          </Link>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.8rem',
            }}
          >
            {userName?.charAt(0)}
          </div>
        </div>
      </div>
    </nav>
  );
}
