import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SecurityIcon from '@mui/icons-material/Security';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import GroupIcon from '@mui/icons-material/Group';
import ForumIcon from '@mui/icons-material/Forum';
import SettingsIcon from '@mui/icons-material/Settings';

export const metadata = {
  title: "Admin Dashboard - NGBHS",
};

export default async function AdminDashboard() {
  const user = await getServerUser();
  
  if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
    redirect("/");
  }

  const stats = [
    { name: "Total Matches", value: "24", icon: <SportsSoccerIcon sx={{ fontSize: '2.5rem' }} /> },
    { name: "Active Batches", value: "12", icon: <SecurityIcon sx={{ fontSize: '2.5rem' }} /> },
    { name: "News Articles", value: "45", icon: <NewspaperIcon sx={{ fontSize: '2.5rem' }} /> },
    { name: "Registered Users", value: "128", icon: <GroupIcon sx={{ fontSize: '2.5rem' }} /> },
  ];

  return (
    <>
      <div className="responsive-grid" style={{ 
        display: 'grid', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat) => (
          <div key={stat.name} className="glass panel-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>{stat.icon}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem' }}>{stat.name}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="glass panel-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SettingsIcon sx={{ color: 'var(--accent-primary)' }} />
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/admin/matches" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <SportsSoccerIcon />
              <span>Manage Matches & Scores</span>
            </Link>
            <Link href="/admin/news" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)', gap: '0.75rem' }}>
              <NewspaperIcon />
              <span>Publish News & Highlights</span>
            </Link>
            <Link href="/admin/posts" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)', gap: '0.75rem' }}>
              <ForumIcon />
              <span>Moderate User Posts</span>
            </Link>
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/users" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)', gap: '0.75rem' }}>
                  <GroupIcon />
                  <span>Manage Users & Roles</span>
                </Link>
                <Link href="/admin/batches" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)', gap: '0.75rem' }}>
                  <SecurityIcon />
                  <span>Edit Batch Standings</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="glass panel-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <span>Database Connection</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <span>Auth Service</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <span>Current Server Time</span>
              <span style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
