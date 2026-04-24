import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";

export default async function CoAdminDashboard() {
  const user = await getServerUser();
  
  if (user?.role !== "CO_ADMIN" && user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div className="badge" style={{ marginBottom: '0.5rem' }}>Tournament Manager Panel</div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Welcome, {user?.name}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Management Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/dashboard/scores" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
              Update Live Scores
            </Link>
            <Link href="/dashboard/news" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
              Write News Update
            </Link>
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Assigned Matches</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You have access to update scores for all matches in the current session.</p>
          {/* List of matches could go here */}
        </div>
      </div>
    </div>
  );
}
