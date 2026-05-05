'use client';

import { useEffect, useState } from 'react';
import { getPostByIdAction } from '@/lib/actions/post.actions';
import CloseIcon from '@mui/icons-material/Close';
import MediaGallery from './MediaGallery';
import PostActions from '@/app/(website)/feed/post-actions';
import UserLink from './UserLink';
import StadiumIcon from '@mui/icons-material/Stadium';

interface PostViewerProps {
  postId: string;
  onClose: () => void;
  currentUserId?: string;
  currentUserBatchId?: string;
  currentUserRole?: string;
}

export default function PostViewer({ postId, onClose, currentUserId, currentUserBatchId, currentUserRole }: PostViewerProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const data = await getPostByIdAction(postId);
        setPost(data);
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    }
    if (postId) fetchPost();
  }, [postId]);

  if (!postId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: 'max(1rem, 2vw)'
    }} onClick={onClose}>
      <div 
        className="glass" 
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(15, 17, 20, 0.98)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(90deg, rgba(235, 183, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-primary)', margin: 0, letterSpacing: '0.02em' }}>Post Details</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <CloseIcon sx={{ fontSize: '1.4rem' }} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div className="loader">Loading...</div>
            </div>
          ) : post ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Author Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '50%', 
                  background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  color: 'black',
                  fontSize: '1.25rem',
                  overflow: 'hidden',
                  border: '2px solid var(--border-color)',
                  flexShrink: 0
                }}>
                  {post.author.image ? (
                    <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    post.author.name?.charAt(0)
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>
                    <UserLink 
                      user={post.author} 
                      currentUserBatchId={currentUserBatchId} 
                      currentUserRole={currentUserRole}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div>
                {post.title && (
                  <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--accent-primary)', marginBottom: '1rem', lineHeight: '1.2' }}>{post.title}</h1>
                )}
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1.15rem', 
                    lineHeight: '1.6',
                    overflowWrap: 'break-word'
                  }}
                />
              </div>

              {/* Media Section */}
              {post.media && post.media.length > 0 && (
                <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <MediaGallery media={post.media} />
                </div>
              )}

              {/* Interaction Section */}
              <div style={{ marginTop: '1rem' }}>
                <PostActions 
                  postId={post.id}
                  initialCheers={post.cheers}
                  initialComments={post.comments}
                  currentUserId={currentUserId}
                  postUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}${window.location.pathname}#post-${post.id}`}
                />
              </div>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
              <StadiumIcon sx={{ fontSize: '4rem', opacity: 0.2 }} />
              <p style={{ fontWeight: '700' }}>Post not found or has been removed.</p>
              <button onClick={onClose} className="btn glass">Go Back</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .loader {
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
