import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "./moderation-actions";
import MediaGallery from "@/app/components/MediaGallery";
import PostOptions from "@/app/components/PostOptions";

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const posts = await prisma.post.findMany({
    where: {
      status: 'PENDING',
      scope: 'GLOBAL'
    },
    include: {
      author: true,
      media: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
            {/* Post Header */}
            <div style={{ padding: '0.85rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                <div style={{ 
                  width: '36px', 
                  minWidth: '36px',
                  height: '36px', 
                  borderRadius: '50%', 
                  background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: 'black',
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  border: post.author.image ? '1px solid var(--border-color)' : 'none',
                  flexShrink: 0
                }}>
                  {post.author.image ? (
                    <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    post.author.name?.charAt(0)
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '1.05rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '2px' }}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                <span className="badge" style={{ 
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.55rem',
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

            <a 
              href={`#post-${post.id}`}
              className="clickable-post"
              style={{ padding: '1rem 1rem 0.5rem' }}
            >
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Story'}</h3>
              <div 
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.95rem', 
                  overflowWrap: 'break-word', 
                  wordBreak: 'break-word' 
                }}
              />
            </a>

            {/* Post Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Moderation Actions */}
            {post.status === 'PENDING' && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <ModerationActions postId={post.id} />
              </div>
            )}
          </article>
        )) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
            No user posts to moderate at the moment.
          </div>
        )}
      </div>
    </>
  );
}
