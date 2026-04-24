'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Matches", href: "/matches" },
    { name: "Standings", href: "/standings" },
    { name: "News", href: "/news" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: 0,
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.jpg" alt="NGBHS Logo" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>
            <Link href="/">
              <span style={{ color: 'white' }}>NGBHS Reunion</span> <span className="text-gradient">Championship</span>
            </Link>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '2rem', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: isActive ? 'white' : 'var(--text-muted)', transition: 'all 0.2s ease' }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {loading ? (
            <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : user ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginRight: '1rem' }}>
                {user.role === "ADMIN" && (
                  <Link href="/admin" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700' }}>Admin Panel</Link>
                )}
                {(user.role === "CO_ADMIN" || user.role === "ADMIN") && (
                  <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: '700' }}>Manager Dashboard</Link>
                )}
                <Link href="/profile" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Profile</Link>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn glass" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/register" className="btn glass" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Register</Link>
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
