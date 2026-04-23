import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const stats = [
    { name: "Total Matches", value: "24", icon: "⚽" },
    { name: "Active Batches", value: "12", icon: "🛡️" },
    { name: "News Articles", value: "45", icon: "📰" },
    { name: "Registered Users", value: "128", icon: "👥" },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div className="badge" style={{ marginBottom: '0.5rem' }}>Admin Control Center</div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>System Overview</h1>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        {stats.map((stat) => (
          <div key={stat.name} className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{stat.icon}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem' }}>{stat.name}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/admin/matches" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
              Manage Matches & Scores
            </Link>
            <Link href="/admin/news" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
              Publish News & Highlights
            </Link>
            <Link href="/admin/posts" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
              Moderate User Posts
            </Link>
            <Link href="/admin/users" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
              Manage Users & Roles
            </Link>
            <Link href="/admin/batches" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
              Edit Batch Standings
            </Link>
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
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
    </div>
  );
}
