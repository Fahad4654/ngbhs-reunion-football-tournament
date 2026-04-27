'use client';

import { useState } from 'react';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import type { AppUser } from "@/lib/server-auth";

export default function Navbar({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Matches", href: "/matches" },
    { name: "Standings", href: "/standings" },
    { name: "Feed", href: "/feed" },
    { name: "News", href: "/news" },
  ];

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
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(10, 11, 13, 0.95)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.833vw' }}>
          <img src="/logo.jpg" alt="NGBHS Logo" style={{ width: '3.125vw', height: '3.125vw', borderRadius: '0.521vw', objectFit: 'cover' }} />
          <h1 className="navbar-title" style={{ margin: 0 }}>
            <Link href="/">
              <span className="desktop-only">
                <span style={{ color: 'white' }}>NGBHS Reunion</span> <span className="text-gradient">Championship</span>
              </span>
              <span className="mobile-only text-gradient" style={{ fontWeight: '800' }}>NGBHS 2026</span>
            </Link>
          </h1>
        </div>

        {/* Desktop Links */}
        <div className="desktop-only nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: isActive ? 'white' : 'var(--accent-primary)', transition: 'all 0.2s ease', borderBottom: isActive ? '0.185vh solid var(--accent-primary)' : 'none', paddingBottom: '0.463vh' }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.833vw' }}>
          <div className="desktop-only nav-auth">
            {user ? (
              <>
                <Link href="/dashboard" style={{ fontSize: '1.0vw', color: 'var(--accent-primary)', fontWeight: '700' }}>Dashboard</Link>
                <form action={logout}>
                  <button type="submit" className="btn glass" style={{ padding: '0.926vh 1.042vw', fontSize: '0.9vw' }}>Sign Out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.926vh 1.042vw', fontSize: '1.0vw' }}>Sign In</Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-only btn glass"
            style={{ padding: '0.463vh 0.417vw', minWidth: '4.167vw', height: '4.167vw', fontSize: '1.25vw' }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className="no-scrollbar"
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: '0',
            right: '0',
            bottom: '0',
            padding: '3.704vh 2.604vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.852vh',
            zIndex: 999,
            background: 'rgba(10, 11, 13, 0.98)',
            backdropFilter: 'blur(1.042vw)',
            animation: 'fadeIn 0.2s ease',
            borderTop: '0.052vw solid var(--border-color)'
          }}
        >
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              style={{ padding: '1.389vh', fontSize: '1.458vw', fontWeight: '700', borderBottom: '0.052vw solid var(--border-color)', color: pathname === link.href ? 'var(--accent-primary)' : 'white' }}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ marginTop: '1.852vh', display: 'flex', flexDirection: 'column', gap: '1.389vh' }}>
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25vw' }}>Dashboard</Link>
                <form action={logout}>
                  <button type="submit" className="btn glass" style={{ width: '100%', fontSize: '1.25vw' }}>Sign Out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25vw' }}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
