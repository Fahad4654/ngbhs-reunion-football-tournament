import { getApprovedPosts } from "@/lib/actions";
import { getServerUser } from "@/lib/server-auth";
import PostActions from "./post-actions";
import MediaGallery from "@/app/components/MediaGallery";
import PostOptions from "@/app/components/PostOptions";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StadiumIcon from '@mui/icons-material/Stadium';
import UserLink from "@/app/components/UserLink";
import prisma from "@/lib/prisma";

export const metadata = {
  title: 'Community Feed - NGBHS Reunion',
  description: 'Live updates and shared memories from the NGBHS Reunion community.',
};

export default async function FeedPage() {
  const [posts, userSession] = await Promise.all([
    getApprovedPosts(),
    getServerUser()
  ]);

  const dbUser = userSession ? await prisma.user.findUnique({ where: { id: userSession.uid } }) : null;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '1.852vh', paddingBottom: '3.704vh' }}>
      <div className="container feed-grid">
        
        {/* Left Sidebar - Navigation/Shortcuts */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.852vh)' }} className="desktop-only">
          <div className="glass" style={{ padding: '2.222vh 1.25vw', borderRadius: '1.25vw' }}>
            <h3 style={{ fontSize: 'calc(0.9vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.222vh' }}>Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.741vh' }}>
              <a href="/matches" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.926vh 1.042vw', fontSize: 'calc(0.9vw * var(--font-scale))', textTransform: 'none', gap: '0.75rem' }}>
                <SportsSoccerIcon sx={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }} />
                <span>Matches</span>
              </a>
              <a href="/standings" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.926vh 1.042vw', fontSize: 'calc(0.9vw * var(--font-scale))', textTransform: 'none', gap: '0.75rem' }}>
                <AssessmentIcon sx={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }} />
                <span>Standings</span>
              </a>
              <a href="/news" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.926vh 1.042vw', fontSize: 'calc(0.9vw * var(--font-scale))', textTransform: 'none', gap: '0.75rem' }}>
                <NewspaperIcon sx={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }} />
                <span>News</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.667vw' }}>
          {posts.length > 0 ? posts.map((post) => (
            <article key={post.id} className="glass" style={{ overflow: 'hidden', borderRadius: '1.25vw' }}>
              {/* Post Header */}
              <div style={{ padding: '1.157vh 0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.625vw', flexWrap: 'wrap', borderBottom: '0.052vw solid var(--border-color)', background: 'linear-gradient(90deg, rgba(235, 183, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.833vw', minWidth: 0, flex: '1 1 200px' }}>
                  <div style={{ 
                    width: 'clamp(32px, 8vw, 48px)', 
                    height: 'clamp(32px, 8vw, 48px)', 
                    borderRadius: '50%', 
                    background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: 'clamp(0.9rem, 1vw, 1.2rem)',
                    overflow: 'hidden',
                    border: post.author.image ? '0.052vw solid var(--border-color)' : 'none',
                    flexShrink: 0
                  }}>
                    {post.author.image ? (
                      <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      post.author.name?.charAt(0)
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '800', fontSize: 'clamp(0.9rem, 1.1vw, 1.25rem)', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <UserLink 
                        user={post.author} 
                        currentUserBatchId={dbUser?.batchId || undefined} 
                        currentUserRole={userSession?.role}
                      />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.65rem, 0.7vw, 0.8rem)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                  <PostOptions 
                    postId={post.id}
                    title={post.title}
                    content={post.content}
                    isAuthorized={userSession?.role === 'ADMIN' || userSession?.role === 'CO_ADMIN' || userSession?.uid === post.authorId}
                    media={post.media}
                  />
                </div>
              </div>

              {/* Post Content */}
              <div style={{ padding: '2.222vh 1.25vw 0.741vh' }}>
                <h3 style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.75rem)', marginBottom: '1.481vh', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title}</h3>
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: 'clamp(0.95rem, 1.2vw, 1.35rem)', 
                    overflowWrap: 'break-word', 
                    wordBreak: 'break-word' 
                  }}
                />
              </div>

              {/* Post Media Gallery */}
              <MediaGallery media={post.media} />

              {/* Post Actions (Client Component) */}
              <PostActions 
                postId={post.id}
                initialCheers={post.cheers}
                initialComments={post.comments}
                currentUserId={userSession?.uid}
                postUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/feed#post-${post.id}`}
              />
            </article>
          )) : (
            <div className="glass" style={{ textAlign: 'center', padding: '7.407vh 1.667vw', borderRadius: '1.25vw' }}>
              <div style={{ marginBottom: '2.222vh' }}>
                <StadiumIcon sx={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>The stadium is quiet... Be the first to post!</p>
              <a href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2.963vh' }}>Create First Post</a>
            </div>
          )}
        </main>

        {/* Right Sidebar - Ad/Promo */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.852vh)' }} className="desktop-only">
          <div className="glass" style={{ padding: '2.222vh 1.25vw', borderRadius: '1.25vw', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'calc(0.667vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.222vh' }}>Tournament Partner</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '18.519vh', borderRadius: '0.833vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75vw' }}>
              Your Brand Here
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
