import { getMyPosts } from "@/lib/actions";
import Link from "next/link";
import PostOptions from "@/app/components/PostOptions";
import MediaGallery from "@/app/components/MediaGallery";
import { getServerUser } from "@/lib/server-auth";
import CollapsibleContent from "@/app/components/CollapsibleContent";
import ClickablePost from "@/app/components/ClickablePost";

import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ForumIcon from '@mui/icons-material/Forum';
import DescriptionIcon from '@mui/icons-material/Description';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';

export const dynamic = 'force-dynamic';

export default async function MyPostsPage() {
  const [posts, user] = await Promise.all([
    getMyPosts(),
    getServerUser()
  ]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.222vh' }}>
        <Link href="/dashboard/posts" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <EditIcon sx={{ fontSize: '1.2rem' }} />
          <span>Create New Story</span>
        </Link>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gap: '1.25rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1rem' }}>
            {/* Post Header */}
            <div style={{ padding: '1rem 0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(90deg, rgba(235, 183, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 200px' }}>
                <div style={{ 
                  width: '40px', 
                  minWidth: '40px',
                  height: '40px', 
                  borderRadius: '50%', 
                  background: user?.image ? 'transparent' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: 'black',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  border: user?.image ? '1px solid var(--border-color)' : 'none',
                  flexShrink: 0
                }}>
                  {user?.image ? (
                    <img src={user.image} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '1rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                    Submitted {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                <span className="badge" style={{ 
                  padding: '0.296vh 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  background: 'rgba(255, 215, 0, 0.1)',
                  color: 'var(--accent-secondary)',
                  border: '1px solid currentColor',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {post.scope === 'BATCH' ? <SchoolIcon sx={{ fontSize: '0.9rem' }} /> : <PublicIcon sx={{ fontSize: '0.9rem' }} />}
                  <span className="desktop-only">{post.scope === 'BATCH' ? 'BATCH ONLY' : 'GLOBAL'}</span>
                </span>
                <span className="badge" style={{ 
                  padding: '0.296vh 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  background: post.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : post.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                  color: post.status === 'APPROVED' ? '#10b981' : post.status === 'REJECTED' ? '#ef4444' : 'var(--accent-secondary)',
                  border: '1px solid currentColor',
                  borderRadius: '4px'
                }}>
                  {post.status}
                </span>
                <PostOptions 
                  postId={post.id}
                  title={post.title}
                  content={post.content}
                  isAuthorized={true}
                  media={post.media}
                />
              </div>
            </div>

            <ClickablePost 
              postId={post.id}
              style={{ padding: '1.25rem 1rem 0.75rem' }}
            >
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Story'}</h3>
              <CollapsibleContent htmlContent={post.content} maxHeight={250} />
            </ClickablePost>

            {/* Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Footer Stats */}
            <div style={{ display: 'flex', gap: '1.25rem', borderTop: '1px solid var(--border-color)', padding: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <EmojiEventsIcon sx={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'white', fontWeight: '700' }}>{post._count.cheers}</span> Cheers
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ForumIcon sx={{ fontSize: '1rem', color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'white', fontWeight: '700' }}>{post._count.comments}</span> Comments
                </div>
              </div>
              {post.status === 'APPROVED' && (
                <Link href={post.scope === 'BATCH' ? `/dashboard/batch-feed#post-${post.id}` : `/feed#post-${post.id}`} style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  View on Feed →
                </Link>
              )}
            </div>
          </article>
        )) : (
          <div className="glass" style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <DescriptionIcon sx={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No stories shared yet</h3>
            <p style={{ fontSize: '1rem' }}>Your approved posts will appear here and in the community feed.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2rem' }}>Create Your First Post</Link>
          </div>
        )}
      </div>
    </>
  );
}
