"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { markAsRead, markAllAsRead } from "@/lib/actions/notification.actions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="glass" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: "700", fontSize: "1.2rem" }}>Recent Activity</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            You have {unreadCount} unread notification{unreadCount !== 1 && "s"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn glass" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem" }} />
            Mark all as read
          </button>
        )}
      </div>

      <div>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              style={{ 
                padding: "1.5rem", 
                borderBottom: "1px solid rgba(255,255,255,0.05)", 
                background: n.read ? "transparent" : "rgba(235, 183, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                transition: "background 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: n.read ? "var(--text-secondary)" : "white" }}>
                    {n.title}
                  </h3>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem", lineHeight: "1.5" }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem", opacity: 0.7 }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
                  {!n.read && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "var(--accent-primary)", 
                        fontSize: "0.8rem", 
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px"
                      }}
                      className="hover-bg"
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
                      Mark read
                    </button>
                  )}
                  {n.link && (
                    <Link 
                      href={n.link} 
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      style={{ 
                        textDecoration: "none", 
                        color: "white", 
                        background: "rgba(255,255,255,0.1)", 
                        padding: "0.4rem 0.75rem", 
                        borderRadius: "6px", 
                        fontSize: "0.8rem", 
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      View <OpenInNewIcon sx={{ fontSize: "0.9rem" }} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>📭</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem", color: "white" }}>No notifications yet</h3>
            <p>When you get notifications, they will appear here.</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", borderTop: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
          Showing top {notifications.length} recent notifications
        </div>
      )}
    </div>
  );
}
