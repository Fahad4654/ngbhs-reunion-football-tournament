'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import type { AppUser } from "@/lib/server-auth";

interface SidebarProps {
  user: AppUser;
  onClose?: () => void;
}

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { name: "Overview", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin" : "/dashboard", icon: "📊" },
    { name: "Create Post", href: "/dashboard/posts", icon: "✍️", roles: ["USER", "BATCH_MANAGER"] },
    { name: "My Posts", href: "/dashboard/posts/my-posts", icon: "📝", roles: ["USER", "BATCH_MANAGER"] },
    { name: "Batch Feed", href: "/dashboard/batch-feed", icon: "🎓", roles: ["USER", "BATCH_MANAGER"] },
    { name: "Manage Batch", href: "/dashboard/manage-batch", icon: "🛠️", roles: ["BATCH_MANAGER"] },
    { name: "Matches", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/matches" : "/dashboard/scores", icon: "⚽", roles: ["ADMIN", "CO_ADMIN"] },
    { name: "News Manager", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/news" : "/dashboard/news", icon: "📰", roles: ["ADMIN", "CO_ADMIN"] },
    { name: "Post Moderation", href: "/admin/posts", icon: "💬", roles: ["ADMIN", "CO_ADMIN"] },
  ];

  const adminOnlyLinks = [
    { name: "Batch Settings", href: "/admin/batches", icon: "🛡️" },
    { name: "User Access", href: "/admin/users", icon: "👥" },
  ];

  return (
    <aside className="glass no-scrollbar" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      borderRadius: 0,
      borderRight: '1px solid var(--border-color)',
      overflow: 'hidden',
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none'
    }}>
      {/* Fixed Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(10, 11, 13, 0.2)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.jpg" alt="NGBHS Logo" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: '800' }}>NGBHS</h2>
            <p style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', margin: 0 }}>Management</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="mobile-only btn glass"
              style={{ padding: '0.5rem', minWidth: '36px', height: '36px', borderRadius: '50%', color: 'white' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.4rem', marginLeft: '0.5rem' }}>
              Main Menu
            </div>
            
            {mainLinks.filter(l => !l.roles || l.roles.includes(user.role)).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {(user.role === "ADMIN" || user.role === "CO_ADMIN") && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.4rem', marginLeft: '0.5rem' }}>
                Administrative
              </div>
              {adminOnlyLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '10px',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(10, 11, 13, 0.4)' }}>
        <Link 
          href="/profile"
          className="btn-profile-sidebar"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1.25rem', 
            padding: '0.5rem',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
        >
          <div style={{ 
            width: '40px', 
            minWidth: '40px',
            height: '40px', 
            borderRadius: '50%', 
            background: user.image ? 'transparent' : 'var(--accent-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'black',
            fontWeight: '800',
            fontSize: '1.1rem',
            overflow: 'hidden',
            border: user.image ? '2px solid var(--border-color)' : 'none'
          }}>
            {user.image ? (
              <img src={user.image} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user.name || 'User').charAt(0).toLowerCase()
            )}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: '700', color: 'white', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'User'}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
        </Link>

        <Link href="/" className="btn glass" style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-primary)', justifyContent: 'center', border: '1px solid rgba(235, 183, 0, 0.2)' }}>
          🏠 EXIT TO WEBSITE
        </Link>
        <form action={logout}>
          <button type="submit" className="btn glass" style={{ width: '100%', color: '#ff4444', fontSize: '0.8rem', fontWeight: '700', justifyContent: 'center' }}>
            🚪 SIGN OUT
          </button>
        </form>
      </div>
    </aside>
  );
}
