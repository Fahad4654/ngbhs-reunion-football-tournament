'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";
import type { AppUser } from "@/lib/server-auth";
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarProps {
  user: AppUser;
  onClose?: () => void;
}

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { name: "Overview", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin" : "/dashboard", icon: <AssessmentIcon /> },
    { name: "Create Post", href: "/dashboard/posts", icon: <EditIcon />, roles: ["USER", "BATCH_MANAGER"] },
    { name: "My Posts", href: "/dashboard/posts/my-posts", icon: <DescriptionIcon />, roles: ["USER", "BATCH_MANAGER"] },
    { name: "Batch Feed", href: "/dashboard/batch-feed", icon: <SchoolIcon />, roles: ["USER", "BATCH_MANAGER"] },
    { name: "Manage Batch", href: "/dashboard/manage-batch", icon: <SettingsIcon />, roles: ["BATCH_MANAGER"] },
    { name: "Team Management", href: "/dashboard/team-management", icon: <GroupIcon />, roles: ["BATCH_MANAGER"] },
    { name: "Matches", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/matches" : "/dashboard/scores", icon: <SportsSoccerIcon />, roles: ["ADMIN", "CO_ADMIN"] },
    { name: "News Manager", href: (user.role === "ADMIN" || user.role === "CO_ADMIN") ? "/admin/news" : "/dashboard/news", icon: <NewspaperIcon />, roles: ["ADMIN", "CO_ADMIN", "BATCH_MANAGER"] },
    { name: "Members", href: "/dashboard/members", icon: <GroupIcon />, roles: ["USER", "BATCH_MANAGER"] },
    { name: "Post Moderation", href: "/admin/posts", icon: <ForumIcon />, roles: ["ADMIN", "CO_ADMIN"] },
  ];

  const adminOnlyLinks = [
    { name: "Tournaments", href: "/admin/tournaments", icon: <AssessmentIcon />, roles: ["ADMIN", "CO_ADMIN"] },
    { name: "Batch Settings", href: "/admin/batches", icon: <SecurityIcon />, roles: ["ADMIN"] },
    { name: "User Access", href: "/admin/users", icon: <GroupIcon />, roles: ["ADMIN"] },
  ];

  return (
    <aside className="glass no-scrollbar" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      borderRadius: 0,
      borderRight: '0.052vw solid var(--border-color)',
      overflow: 'hidden',
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none'
    }}>
      {/* Fixed Header */}
      <div style={{ padding: 'calc(1.5vh * var(--font-scale)) calc(1vw * var(--font-scale))', borderBottom: '0.052vw solid var(--border-color)', background: 'rgba(10, 11, 13, 0.2)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(0.75vw * var(--font-scale))' }}>
          <img src="/logo.jpg" alt="NGBHS Logo" className="navbar-logo" />
          <div style={{ flex: 1 }}>
            <h2 className="sidebar-brand-title" style={{ margin: 0, color: 'white' }}>
              <span>NGBHS REUNION</span>
              <span className="text-gradient">FOOTBALL CHAMPIONSHIP</span>
            </h2>
            <p style={{ fontSize: 'calc(0.6vw * var(--font-scale))', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', margin: 0, marginTop: '0.5vh' }}>Management Panel</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="mobile-nav-toggle btn glass"
              style={{ padding: 0, minWidth: '40px', height: '40px' }}
            >
              <CloseIcon sx={{ fontSize: '1.5rem' }} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.2vh 1.042vw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2vh' }}>
            <div style={{ fontSize: 'calc(0.85vw * var(--font-scale))', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.078vw', marginBottom: '0.4vh', marginLeft: '0.417vw' }}>
              Main Menu
            </div>
            
            {mainLinks.filter(l => !l.roles || l.roles.includes(user.role)).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.5rem, 0.75vw * var(--font-scale), 1rem)',
                    padding: 'clamp(0.5rem, 0.5vh * var(--font-scale), 0.7rem) clamp(0.75rem, 0.75vw * var(--font-scale), 1rem)',
                    borderRadius: 'clamp(0.4rem, 0.5vw * var(--font-scale), 0.8rem)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: 'clamp(1.05rem, 1vw * var(--font-scale), 1.15rem)'
                  }}
                >
                  <span style={{ 
                    fontSize: 'clamp(1.2rem, 1.2vw * var(--font-scale), 1.4rem)', 
                    display: 'flex', 
                    alignItems: 'center',
                    color: isActive ? 'var(--accent-primary)' : 'inherit' 
                  }}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {(user.role === "ADMIN" || user.role === "CO_ADMIN") && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2vh' }}>
              <div style={{ fontSize: 'calc(0.8vw * var(--font-scale))', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.078vw', marginBottom: '0.4vh', marginLeft: '0.417vw' }}>
                Administrative
              </div>
              {adminOnlyLinks.filter(l => !l.roles || l.roles.includes(user.role)).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(0.5rem, 0.625vw * var(--font-scale), 1rem)',
                      padding: 'clamp(0.5rem, 0.5vh * var(--font-scale), 0.7rem) clamp(0.75rem, 0.708vw * var(--font-scale), 1rem)',
                      borderRadius: 'clamp(0.4rem, 0.521vw * var(--font-scale), 0.8rem)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: 'clamp(1.05rem, 1vw * var(--font-scale), 1.15rem)'
                    }}
                  >
                    <span style={{ 
                      fontSize: 'clamp(1.2rem, 1.1vw * var(--font-scale), 1.3rem)', 
                      display: 'flex', 
                      alignItems: 'center',
                      color: isActive ? 'var(--accent-primary)' : 'inherit' 
                    }}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div style={{ padding: '2vh 1.5vw', borderTop: '0.052vw solid var(--border-color)', background: 'rgba(10, 11, 13, 0.4)', display: 'flex', flexDirection: 'column', gap: '1.25vh' }}>
        <Link 
          href="/" 
          className="btn glass" 
          style={{ 
            width: '100%', 
            fontSize: 'clamp(0.75rem, 0.9vw, 0.9rem)', 
            fontWeight: '800', 
            color: 'var(--accent-primary)', 
            justifyContent: 'center', 
            border: '1px solid rgba(235, 183, 0, 0.3)', 
            gap: '0.75rem',
            padding: '1vh 1.25vw',
            whiteSpace: 'nowrap'
          }}
        >
          <HomeIcon sx={{ fontSize: '1.25rem' }} />
          <span>EXIT TO WEBSITE</span>
        </Link>

        <form action={logout} style={{ width: '100%' }}>
          <button 
            type="submit" 
            className="btn glass" 
            style={{ 
              width: '100%', 
              color: '#ff4444', 
              fontSize: 'clamp(0.75rem, 0.9vw, 0.9rem)', 
              fontWeight: '700', 
              justifyContent: 'center', 
              gap: '0.75rem',
              padding: '0.75vh 1vw',
              border: '1px solid rgba(255, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ExitToAppIcon sx={{ fontSize: '1.25rem' }} />
            <span style={{ whiteSpace: 'nowrap' }}>SIGN OUT</span>
          </button>
        </form>
      </div>

      {/* Author Credit */}
      <div style={{ 
        padding: '1vh 1.5vw', 
        fontSize: 'calc(0.65vw * var(--font-scale))', 
        color: 'var(--text-muted)', 
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        background: 'rgba(10, 11, 13, 0.2)'
      }}>
        Developed by <span className="text-gradient" style={{ fontWeight: '700' }}>Fahad</span>
      </div>
    </aside>
  );
}
