import Link from 'next/link';
import { getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import EditIcon from '@mui/icons-material/Edit';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const metadata = {
  title: 'My Activity - NGBHS Reunion',
};

export default async function ActivityPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [myPosts, myCheers, myComments] = await Promise.all([
    prisma.post.findMany({
      where: { 
        authorId: user.uid,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.cheer.findMany({
      where: { 
        userId: user.uid,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      include: { post: true }
    }),
    prisma.comment.findMany({
      where: { 
        authorId: user.uid,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      include: { post: true }
    })
  ]);

  interface ActivityItem {
    type: 'POST' | 'REACTION' | 'COMMENT';
    title: string;
    content?: string;
    createdAt: Date;
    link: string;
  }

  const activities: ActivityItem[] = [
    ...myPosts.map(p => ({
      type: 'POST' as const,
      title: p.title || 'Shared a new story',
      content: p.content,
      createdAt: p.createdAt,
      link: p.scope === 'BATCH' ? `/dashboard/batch-feed#post-${p.id}` : `/feed#post-${p.id}`
    })),
    ...myCheers.map(c => ({
      type: 'REACTION' as const,
      title: `Reacted to post: ${c.post.title || 'Post'}`,
      createdAt: c.createdAt,
      link: c.post.scope === 'BATCH' ? `/dashboard/batch-feed#post-${c.post.id}` : `/feed#post-${c.post.id}`
    })),
    ...myComments.map(c => ({
      type: 'COMMENT' as const,
      title: `Commented on: ${c.post.title || 'Post'}`,
      content: c.content,
      createdAt: c.createdAt,
      link: c.post.scope === 'BATCH' ? `/dashboard/batch-feed#post-${c.post.id}` : `/feed#post-${c.post.id}`
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(0.5rem, 2vw, 1rem)', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>
            <ArrowBackIcon sx={{ fontSize: '1.1rem' }} /> Back to Dashboard
        </Link>
        
        <header style={{ marginBottom: '2rem' }}>
            <h1 className="text-gradient" style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '0.5rem' }}>Your Activity History</h1>
            <p style={{ color: 'var(--text-secondary)' }}>A complete record of your interactions within the last 30 days.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length > 0 ? activities.map((activity, index) => (
                <div key={index} className="glass panel-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '12px', 
                        background: activity.type === 'POST' ? 'rgba(59, 130, 246, 0.1)' : 
                                   activity.type === 'REACTION' ? 'rgba(235, 183, 0, 0.1)' : 
                                   'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activity.type === 'POST' ? '#3b82f6' : 
                               activity.type === 'REACTION' ? 'var(--accent-primary)' : 
                               '#10b981',
                        border: '1px solid rgba(255,255,255,0.05)',
                        flexShrink: 0
                    }}>
                        {activity.type === 'POST' ? <EditIcon /> : 
                         activity.type === 'REACTION' ? <SportsSoccerIcon /> :
                         <ForumIcon />}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontSize: '1.05rem', color: 'white', fontWeight: '700' }}>{activity.title}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {activity.content && (
                            <div style={{ 
                                color: 'var(--text-secondary)', 
                                fontSize: '0.9rem', 
                                marginBottom: '0.75rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }} dangerouslySetInnerHTML={{ __html: activity.content.substring(0, 200) }} />
                        )}
                        <Link href={activity.link} style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--accent-primary)', 
                            fontWeight: '700',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            View Post →
                        </Link>
                    </div>
                </div>
            )) : (
                <div className="glass panel-card" style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.5 }}>
                    <p>No activity recorded yet.</p>
                </div>
            )}
        </div>
    </div>
  );
}
