import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { getUserActivity } from "@/lib/actions";
import PageHeader from "@/app/components/panel/PageHeader";

export default async function Dashboard() {
  const user = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  const activity = await getUserActivity();

  return (
    <>
      <PageHeader 
        badge={user.role === 'ADMIN' ? 'System Administrator' : user.role === 'CO_ADMIN' ? 'Tournament Manager' : 'Player Dashboard'} 
        title={`Welcome, ${user?.name}`} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Main Role-Based Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {user.role === 'USER' ? 'Your Participation' : 'Management Tasks'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user.role === 'USER' ? (
              <>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome to the NGBHS Reunion Football Championship. You can track your batch's progress and update your player profile here.</p>
                <Link href="/dashboard/posts" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  ✍️ Create New Post
                </Link>
                <Link href="/profile" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
                  👤 Update My Profile
                </Link>
                <Link href="/matches" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
                  ⚽ View My Batch Matches
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/scores" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  Update Live Scores
                </Link>
                <Link href="/dashboard/news" className="btn glass" style={{ justifyContent: 'flex-start', border: '1px solid var(--border-color)' }}>
                  Write News Update
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Your Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activity ? (
              <>
                {/* Recent Posts */}
                {activity.posts.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>My Posts</h3>
                      <Link href="/dashboard/posts/my-posts" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>VIEW ALL</Link>
                    </div>
                    {activity.posts.map(post => (
                      <Link key={post.id} href="/feed" style={{ display: 'block', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'white' }}>{post.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.status} • {new Date(post.createdAt).toLocaleDateString()}</div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Recent Cheers */}
                {activity.cheers.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Reacted To</h3>
                    {activity.cheers.map(cheer => (
                      <div key={cheer.id} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                        🏆 Cheered on <span style={{ color: 'white' }}>"{cheer.post.title}"</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Comments */}
                {activity.comments.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Commented On</h3>
                    {activity.comments.map(comment => (
                      <div key={comment.id} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                        💬 <span style={{ color: 'white' }}>"{comment.post.title}"</span>
                      </div>
                    ))}
                  </div>
                )}

                {activity.posts.length === 0 && activity.cheers.length === 0 && activity.comments.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No recent activity to show.</p>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Loading activity...</p>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {user.role === 'USER' ? 'Batch Information' : 'Assigned Matches'}
          </h2>
          {user.role === 'USER' ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Batch: <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{user.batchId || 'Not set'}</span>
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Stay tuned for match schedules and batch rankings. Make sure your profile information is complete for the tournament registration.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>You have access to update scores for all matches in the current session.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
