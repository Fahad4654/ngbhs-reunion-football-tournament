import Link from 'next/link';
import { getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NewspaperIcon from '@mui/icons-material/Newspaper';

export const metadata = {
  title: 'Dashboard - NGBHS Reunion',
};

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch recent activities (posts and news)
  const [recentPosts, recentNews] = await Promise.all([
    prisma.post.findMany({
      where: { 
        OR: [
          { authorId: user.uid },
          { scope: 'GLOBAL' }
        ],
        status: 'APPROVED'
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    }),
    prisma.news.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const activities = [
    ...recentPosts.map(p => ({
      type: 'POST',
      title: `${p.author.name} shared: ${p.title || 'a story'}`,
      createdAt: p.createdAt
    })),
    ...recentNews.map(n => ({
      type: 'NEWS',
      title: `News: ${n.title}`,
      createdAt: n.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div className="responsive-grid" style={{ display: 'grid', gap: '1.25vw' }}>
        {/* Main Role-Based Card */}
        <div className="glass panel-card" style={{ padding: '1.852vh 1.667vw' }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 1.5vw, 2rem)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AssessmentIcon sx={{ color: 'var(--accent-primary)', fontSize: '2rem' }} />
            {user.role === 'USER' ? 'Your Participation' : 'Management Tasks'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.481vh' }}>
            {user.role === 'USER' ? (
              <>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome to the NGBHS Reunion Football Championship. You can track your batch's progress and update your player profile here.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <Link href="/dashboard/posts" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem', flex: '1', minWidth: '200px' }}>
                    <EditIcon />
                    <span>Create New Post</span>
                  </Link>
                  <Link href="/profile" className="btn glass" style={{ justifyContent: 'flex-start', border: '0.052vw solid var(--border-color)', gap: '0.75rem', flex: '1', minWidth: '200px' }}>
                    <PersonIcon />
                    <span>Update My Profile</span>
                  </Link>
                  <Link href="/matches" className="btn glass" style={{ justifyContent: 'flex-start', border: '0.052vw solid var(--border-color)', gap: '0.75rem', flex: '1', minWidth: '200px' }}>
                    <SportsSoccerIcon />
                    <span>View My Batch Matches</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <Link href="/dashboard/scores" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem', flex: '1', minWidth: '200px' }}>
                    <SportsSoccerIcon />
                    <span>Update Live Scores</span>
                  </Link>
                  <Link href="/dashboard/news" className="btn glass" style={{ justifyContent: 'flex-start', border: '0.052vw solid var(--border-color)', gap: '0.75rem', flex: '1', minWidth: '200px' }}>
                    <NewspaperIcon />
                    <span>Write News Update</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="glass panel-card" style={{ padding: '1.852vh 1.667vw' }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 1.5vw, 2rem)', marginBottom: '1.5rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="activity-item" style={{ 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black'
                  }}>
                    {activity.type === 'MATCH' ? <SportsSoccerIcon /> : activity.type === 'NEWS' ? <NewspaperIcon /> : <EditIcon />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{activity.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(activity.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent activity to show.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
