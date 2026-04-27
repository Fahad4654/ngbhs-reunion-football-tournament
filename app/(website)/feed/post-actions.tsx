'use client';

import { useState } from 'react';
import { toggleCheer } from '@/lib/actions';
import CommentSection from './comment-section';
import { toast } from 'react-hot-toast';

interface PostActionsProps {
  postId: string;
  initialCheers: any[];
  initialComments: any[];
  currentUserId?: string;
  postUrl: string;
}

export default function PostActions({ postId, initialCheers, initialComments, currentUserId, postUrl }: PostActionsProps) {
  const [showComments, setShowComments] = useState(false);
  const [isCheering, setIsCheering] = useState(false);
  
  const hasCheered = initialCheers.some(c => c.userId === currentUserId);

  const handleCheer = async () => {
    if (!currentUserId) {
      toast.error('Please login to cheer!');
      setTimeout(() => window.location.href = '/login', 1500);
      return;
    }
    setIsCheering(true);
    await toggleCheer(postId);
    setIsCheering(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NGBHS Reunion Feed Post',
          url: postUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(postUrl);
      toast.success('Post link copied to clipboard!');
    }
  };

  return (
    <>
      <div className="post-actions-container" style={{ padding: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.25rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
          <span>🏆 {initialCheers.length} {initialCheers.length === 1 ? 'Cheer' : 'Cheers'}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
            {initialComments.length} {initialComments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '0.15rem', 
          paddingTop: '0.5rem', 
          paddingBottom: '0.5rem',
          width: '100%'
        }}>
          <button 
            onClick={handleCheer}
            className="btn glass" 
            style={{ 
              flex: 1,
              padding: '0.45rem 0', 
              fontSize: '0.6rem', 
              color: hasCheered ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderColor: hasCheered ? 'var(--accent-primary)' : 'var(--border-color)',
              background: hasCheered ? 'rgba(235, 183, 0, 0.1)' : 'transparent',
              textTransform: 'none',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.1rem',
              letterSpacing: '-0.02em'
            }}
            disabled={isCheering}
          >
            <span style={{ fontSize: '0.7rem' }}>⚽</span> Cheer
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="btn glass" 
            style={{ 
              flex: 1,
              padding: '0.45rem 0', 
              fontSize: '0.6rem', 
              color: showComments ? 'white' : 'var(--text-muted)',
              background: showComments ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              textTransform: 'none',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.1rem',
              letterSpacing: '-0.02em'
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>💬</span> Comment
          </button>
          <button 
            onClick={handleShare}
            className="btn glass" 
            style={{ 
              flex: 1,
              padding: '0.45rem 0', 
              fontSize: '0.6rem', 
              color: 'var(--text-muted)', 
              textTransform: 'none', 
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.1rem',
              letterSpacing: '-0.02em'
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>📢</span> Share
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection 
          postId={postId} 
          comments={initialComments} 
          currentUserId={currentUserId} 
        />
      )}
    </>
  );
}
