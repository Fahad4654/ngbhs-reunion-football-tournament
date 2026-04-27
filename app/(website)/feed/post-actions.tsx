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
      <div className="post-actions-container" style={{ padding: '0.25rem 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.25rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
          <span>🏆 {initialCheers.length} {initialCheers.length === 1 ? 'Cheer' : 'Cheers'}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
            {initialComments.length} {initialComments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.35rem', 
          paddingTop: '0.5rem', 
          paddingBottom: '0.5rem' 
        }}>
          <button 
            onClick={handleCheer}
            className="btn glass" 
            style={{ 
              padding: '0.45rem 0.1rem', 
              fontSize: '0.65rem', 
              color: hasCheered ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderColor: hasCheered ? 'var(--accent-primary)' : 'var(--border-color)',
              background: hasCheered ? 'rgba(235, 183, 0, 0.1)' : 'transparent',
              textTransform: 'none',
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
            disabled={isCheering}
          >
            <span style={{ fontSize: '0.85rem' }}>⚽</span> Cheer
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="btn glass" 
            style={{ 
              padding: '0.45rem 0.1rem', 
              fontSize: '0.65rem', 
              color: showComments ? 'white' : 'var(--text-muted)',
              background: showComments ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              textTransform: 'none',
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>💬</span> Comment
          </button>
          <button 
            onClick={handleShare}
            className="btn glass" 
            style={{ 
              padding: '0.45rem 0.1rem', 
              fontSize: '0.65rem', 
              color: 'var(--text-muted)', 
              textTransform: 'none', 
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>📢</span> Share
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
