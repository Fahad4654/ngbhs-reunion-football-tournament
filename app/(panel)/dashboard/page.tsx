import Link from 'next/link';
import { getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const metadata = {
  title: 'Dashboard - NGBHS Reunion',
};

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch data for stats and activities
  const [recentPosts, recentNews, matchCount, postCount] = await Promise.all([
    prisma.post.findMany({
      where: { 
        OR: [
          { authorId: user.uid },
          { scope: 'GLOBAL' }
        ],
        status: 'APPROVED'
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    }),
    prisma.news.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.match.count({ where: { status: 'LIVE' } }),
    prisma.post.count({ where: { status: 'PENDING' } })
  ]);

  const activities = [
    ...recentPosts.map(p => ({
      type: 'POST',
      title: p.title || 'Shared a new story',
      user: p.author.name,
      createdAt: p.createdAt
    })),
    ...recentNews.map(n => ({
      type: 'NEWS',
      title: n.title,
      user: 'Official News',
      createdAt: n.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vw, 2rem)', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Stats Row */}
      <div className="responsive-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 40vw, 250px), 1fr))', 
        gap: 'clamp(0.75rem, 2vw, 1.5rem)' 
      }}>
        <div className="glass panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ background: 'rgba(235, 183, 0, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent-primary)', flexShrink: 0 }}>
            <SportsSoccerIcon />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Live Matches</div>
            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '900' }}>{matchCount}</div>
          </div>
        </div>

        <div className="glass panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#3b82f6', flexShrink: 0 }}>
            <GroupsIcon />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Batch Members</div>
            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '900' }}>1,240+</div>
          </div>
        </div>

        {user.role !== 'USER' && (
          <div className="glass panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', borderLeft: '4px solid var(--accent-danger)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent-danger)', flexShrink: 0 }}>
              <AssessmentIcon />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pending Posts</div>
              <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '900' }}>{postCount}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
        {/* Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <div className="glass panel-card" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)', height: '100%', position: 'relative', overflow: 'hidden' }}>
             <div className="desktop-only" style={{ 
              position: 'absolute', 
              top: '-20px', 
              right: '-20px', 
              opacity: 0.05,
              transform: 'rotate(-15deg)'
            }}>
              <EmojiEventsIcon sx={{ fontSize: '150px', color: 'var(--accent-primary)' }} />
            </div>

            <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
              <AssessmentIcon sx={{ color: 'var(--accent-primary)' }} />
              {user.role === 'USER' ? 'YOUR PARTICIPATION' : 'MANAGEMENT TASKS'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
              {user.role === 'USER' ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', lineHeight: 1.6 }}>
                    Welcome to your personal dashboard. Share your memories, track match results, and manage your alumni profile.
                  </p>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <Link href="/dashboard/posts" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><EditIcon sx={{ fontSize: '1.2rem' }} /> Create New Post</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                    <Link href="/profile" className="btn glass" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><PersonIcon sx={{ fontSize: '1.2rem' }} /> My Profile</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                    <Link href="/matches" className="btn glass" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><SportsSoccerIcon sx={{ fontSize: '1.2rem' }} /> Match Fixtures</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', lineHeight: 1.6 }}>
                    Quick access to administrative tools and tournament management.
                  </p>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <Link href="/dashboard/scores" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><SportsSoccerIcon sx={{ fontSize: '1.2rem' }} /> Update Live Scores</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                    <Link href="/dashboard/news" className="btn glass" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><NewspaperIcon sx={{ fontSize: '1.2rem' }} /> Write News Update</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                    <Link href="/admin/posts" className="btn glass" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><AssessmentIcon sx={{ fontSize: '1.2rem' }} /> Moderate Posts</span>
                      <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="glass panel-card" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AssessmentIcon sx={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }} />
              RECENT ACTIVITY
            </h2>
            <Link href="/dashboard/posts/my-posts" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="activity-item" style={{ 
                  padding: '0.85rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  transition: 'all 0.3s ease',
                  minWidth: 0
                }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    background: activity.type === 'NEWS' ? 'rgba(235, 183, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activity.type === 'NEWS' ? 'var(--accent-primary)' : 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0
                  }}>
                    {activity.type === 'NEWS' ? <NewspaperIcon sx={{ fontSize: '1rem' }} /> : <EditIcon sx={{ fontSize: '1rem' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {activity.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{activity.user}</span>
                      <span style={{ width: '2px', height: '2px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(activity.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem',
                opacity: 0.5
              }}>
                <AssessmentIcon sx={{ fontSize: '2.5rem', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>No recent activity to show.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
