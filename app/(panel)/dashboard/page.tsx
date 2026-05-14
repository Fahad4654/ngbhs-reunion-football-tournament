import Link from 'next/link';
import { getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ForumIcon from '@mui/icons-material/Forum';

export const metadata = {
  title: 'Dashboard - NGBHS Reunion',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  // Redirect Admins and Co-Admins to the Admin Dashboard
  if (user.role === 'ADMIN' || user.role === 'CO_ADMIN') {
    redirect('/admin');
  }

  // Fetch full user data to check for completeness
  const fullUser = await prisma.user.findUnique({
    where: { id: user.uid },
    include: { batch: true }
  }) as any;

  // Fetch data for stats and activities
  const [myPosts, myCheers, myComments, matchCount] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.uid },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.cheer.findMany({
      where: { userId: user.uid },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { post: true }
    }),
    prisma.comment.findMany({
      where: { authorId: user.uid },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { post: true }
    }),
    prisma.match.count({ where: { status: 'LIVE' } })
  ]);

  const activities = [
    ...myPosts.map(p => ({
      type: 'POST',
      title: p.title || 'Shared a new story',
      user: 'You',
      createdAt: p.createdAt
    })),
    ...myCheers.map(c => ({
      type: 'REACTION',
      title: `Reacted to post: ${c.post.title || 'Post'}`,
      user: 'You',
      createdAt: c.createdAt
    })),
    ...myComments.map(c => ({
      type: 'COMMENT',
      title: `Commented on: ${c.post.title || 'Post'}`,
      user: 'You',
      createdAt: c.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 5);

  const profileFields = [
    { label: 'First Name', value: fullUser?.firstName },
    { label: 'Last Name', value: fullUser?.lastName },
    { label: 'Username', value: fullUser?.username },
    { label: 'Phone', value: fullUser?.phone },
    { label: 'Batch', value: fullUser?.batchId },
    { label: 'Occupation', value: fullUser?.occupation },
    { label: 'Workplace', value: fullUser?.workplace },
    { label: 'Current Address', value: fullUser?.currentAddress },
    { label: 'Permanent Address', value: fullUser?.permanentAddress },
    { label: 'Bio', value: fullUser?.bio },
    { label: 'Profile Picture', value: fullUser?.image },
    { label: 'Birthday', value: fullUser?.birthday },
    { label: 'Gender', value: fullUser?.gender },
    { label: 'Marital Status', value: fullUser?.maritalStatus },
    { label: 'Education', value: fullUser?.education && Array.isArray(fullUser.education) && fullUser.education.length > 0 && fullUser.education[0].institute },
    { label: 'Nicknames', value: fullUser?.nicknames && Array.isArray(fullUser.nicknames) && fullUser.nicknames.length > 0 },
    { label: 'Social Links', value: (fullUser?.secondaryEmail || fullUser?.whatsappNo || fullUser?.facebookUrl || fullUser?.instagramUrl || fullUser?.linkedinUrl || fullUser?.githubUrl || fullUser?.websiteUrl || fullUser?.youtubeUrl) }
  ];

  const completedCount = profileFields.filter(f => !!f.value).length;
  const completionPercentage = Math.round((completedCount / profileFields.length) * 100);
  const isProfileIncomplete = completionPercentage < 100;
  const missingFields = profileFields.filter(f => !f.value).map(f => f.label);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vw, 2rem)', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Profile Completion Prompt */}
      {isProfileIncomplete && (
        <div className="glass" style={{ 
          padding: '2rem', 
          borderRadius: '20px', 
          border: '1px solid rgba(235, 183, 0, 0.4)',
          background: 'linear-gradient(135deg, rgba(235, 183, 0, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}>
          {/* Decorative background circle */}
          <div style={{ 
            position: 'absolute', 
            top: '-20%', 
            right: '-10%', 
            width: '300px', 
            height: '300px', 
            background: 'radial-gradient(circle, rgba(235, 183, 0, 0.2) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚀</span>
                  <h3 style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '900', margin: 0 }}>
                    Complete Your Profile ({completionPercentage}%)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '700px', margin: 0 }}>
                  Boost your visibility in the alumni network! Fill in your details to reach 100%.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{completedCount}/{profileFields.length}</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fields Done</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ 
              width: '100%', 
              height: '10px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '5px', 
              overflow: 'hidden',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ 
                width: `${completionPercentage}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-primary) 0%, #ffcc00 100%)',
                boxShadow: '0 0 10px rgba(235, 183, 0, 0.5)',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/profile" className="btn btn-primary" style={{ 
                padding: '0.8rem 2rem', 
                boxShadow: '0 4px 15px rgba(235, 183, 0, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                UPDATE PROFILE NOW <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
              </Link>
              
              {missingFields.length > 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Next up: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{missingFields[0]}</span>, {missingFields[1] || 'and more'}...
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            position: 'absolute', 
            right: '2rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            fontSize: '6rem', 
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 0
          }}>
            ⚡
          </div>
        </div>
      )}

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
              YOUR PARTICIPATION
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
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
            <Link href="/dashboard/activity" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    background: activity.type === 'POST' ? 'rgba(59, 130, 246, 0.1)' : 
                               activity.type === 'REACTION' ? 'rgba(235, 183, 0, 0.1)' : 
                               'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activity.type === 'POST' ? '#3b82f6' : 
                           activity.type === 'REACTION' ? 'var(--accent-primary)' : 
                           '#10b981',
                    border: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0
                  }}>
                    {activity.type === 'POST' ? <EditIcon sx={{ fontSize: '1rem' }} /> : 
                     activity.type === 'REACTION' ? <SportsSoccerIcon sx={{ fontSize: '1rem' }} /> :
                     <ForumIcon sx={{ fontSize: '1rem' }} />}
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
