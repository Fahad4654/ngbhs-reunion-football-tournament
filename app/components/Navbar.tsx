'use client';

import { useState } from 'react';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import type { AppUser } from "@/lib/server-auth";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

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
          <img src="/logo.jpg" alt="NGBHS Logo" className="navbar-logo" />
          <h1 className="navbar-title" style={{ margin: 0 }}>
            <Link href="/">
              <span className="desktop-only">
                <span style={{ color: 'white' }}>NGBHS REUNION</span> <span className="text-gradient">FOOTBALL CHAMPIONSHIP</span>
              </span>
              <span className="navbar-title-mobile">
                <span style={{ color: 'white', whiteSpace: 'nowrap' }}>NGBHS REUNION</span>
                <span className="text-gradient" style={{ whiteSpace: 'nowrap' }}>FOOTBALL CHAMPIONSHIP</span>
              </span>
            </Link>
          </h1>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
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
          <div className="nav-auth">
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
            className="mobile-nav-toggle btn glass"
            style={{ position: 'relative', zIndex: 1100, padding: 0, minWidth: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isMenuOpen ? <CloseIcon sx={{ color: 'white' }} /> : <MenuIcon sx={{ color: 'white' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className="no-scrollbar"
        style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: '0',
          right: '0',
          bottom: '0',
          padding: '4vh 8vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.852vh',
          zIndex: 999,
          background: 'rgba(10, 11, 13, 0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '0.052vw solid var(--border-color)',
          transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? 'visible' : 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'center'
        }}
      >
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            onClick={() => setIsMenuOpen(false)}
            style={{ padding: '2vh 0', fontSize: '5vw', fontWeight: '700', borderBottom: '0.052vw solid var(--border-color)', color: pathname === link.href ? 'var(--accent-primary)' : 'white', textTransform: 'uppercase', display: 'block', textAlign: 'center' }}
          >
            {link.name}
          </Link>
        ))}
        <div style={{ marginTop: '1.852vh', display: 'flex', flexDirection: 'column', gap: '1.389vh', alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '4.5vw', width: '100%', padding: '1.5vh', justifyContent: 'center' }}>Dashboard</Link>
              <form action={logout} style={{ width: '100%' }}>
                <button type="submit" className="btn glass" style={{ width: '100%', fontSize: '4.5vw', padding: '1.5vh', justifyContent: 'center' }}>Sign Out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '4.5vw', width: '100%', padding: '1.5vh', justifyContent: 'center' }}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
