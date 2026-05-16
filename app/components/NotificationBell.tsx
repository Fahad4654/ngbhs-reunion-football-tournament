'use client';

import { useState, useEffect, useRef } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/lib/actions/notification.actions';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.data || []);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn glass"
        style={{ 
          width: '32px', 
          height: '32px', 
          padding: 0, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)'
        }}
      >
        {unreadCount > 0 ? (
          <>
            <NotificationsIcon sx={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#ff4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: '900',
              padding: '2px 5px',
              borderRadius: '10px',
              border: '2px solid #0a0b0d',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <NotificationsNoneIcon sx={{ fontSize: '1.2rem', color: 'var(--text-muted)' }} />
        )}
      </button>

      {isOpen && (
        <div className="glass" style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '300px',
          maxHeight: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid var(--border-color)',
          background: 'rgba(15, 17, 20, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>NOTIFICATIONS</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--accent-primary)', 
                  fontSize: '0.7rem', 
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }} className="no-scrollbar">
            {notifications.length > 0 ? notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => n.link && handleMarkAsRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: n.read ? 'transparent' : 'rgba(235, 183, 0, 0.05)',
                  cursor: n.link ? 'pointer' : 'default',
                  transition: 'background 0.2s ease'
                }}
              >
                {n.link ? (
                  <Link href={n.link} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: n.read ? 'var(--text-secondary)' : 'white', marginBottom: '4px' }}>
                      {n.title}
                    </div>
                  </Link>
                ) : (
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: n.read ? 'var(--text-secondary)' : 'white', marginBottom: '4px' }}>
                    {n.title}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.6 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
            )) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications yet.
              </div>
            )}
          </div>

          <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)} style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
