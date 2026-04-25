'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import type { AppUser } from "@/lib/server-auth";

interface SidebarProps {
  user: AppUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { name: "Overview", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin" : "/dashboard", icon: "📊" },
    { name: "Create Post", href: "/dashboard/posts", icon: "✍️", roles: ["USER"] },
    { name: "My Posts", href: "/dashboard/posts/my-posts", icon: "📝", roles: ["USER"] },
    { name: "Matches", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/matches" : "/dashboard/scores", icon: "⚽", roles: ["ADMIN", "CO_ADMIN"] },
    { name: "News Manager", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/news" : "/dashboard/news", icon: "📰", roles: ["ADMIN", "CO_ADMIN"] },
    { name: "Post Moderation", href: "/admin/posts", icon: "💬", roles: ["ADMIN", "CO_ADMIN"] },
  ];

  const adminOnlyLinks = [
    { name: "Batch Settings", href: "/admin/batches", icon: "🛡️" },
    { name: "User Access", href: "/admin/users", icon: "👥" },
  ];

  return (
    <aside className="glass" style={{
      width: '280px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      zIndex: 1000,
      borderRadius: 0,
      borderRight: '1px solid var(--border-color)',
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none'
    }}>
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '1px' }}>NGBHS</div>
          <div className="text-gradient" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Management</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
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
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '700' : '500'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
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
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Profile / Logout */}
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--accent-primary)',
            color: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.9rem'
          }}>
            {user.name?.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '700', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
        </div>

        <Link href="/" className="btn glass" style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}>
          🏠 Exit to Website
        </Link>
        
        <form action={logout}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem', justifyContent: 'center', background: 'rgba(235, 183, 0, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>
            🔒 Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
