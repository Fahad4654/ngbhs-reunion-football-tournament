'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/posts': 'Dashboard',
  '/dashboard/posts/my-posts': 'Dashboard',
  '/dashboard/batch-feed': 'Dashboard',
  '/dashboard/manage-batch': 'Dashboard',
  '/dashboard/scores': 'Dashboard',
  '/admin': 'Administration',
  '/admin/batches': 'Administration',
  '/admin/matches': 'Administration',
  '/admin/news': 'Administration',
  '/admin/posts': 'Administration',
  '/admin/users': 'Administration',
};

interface PanelNavbarProps {
  userName: string | null;
}

export default function PanelNavbar({ userName }: PanelNavbarProps) {
  const pathname = usePathname();
  
  // Find the matching title by checking if the current path starts with any of our keys
  // Sort keys by length (longest first) to match specific routes before general ones
  const matchingKey = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname.startsWith(key));
    
  const pageTitle = matchingKey ? PAGE_TITLES[matchingKey] : 'Management';

  return (
    <nav
      className="glass"
      style={{
        height: '72px',
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
        <h2 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {pageTitle}
        </h2>
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
