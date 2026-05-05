'use client';

import { useState } from 'react';
import { addComment } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import CollapsibleContent from '@/app/components/CollapsibleContent';

interface CommentSectionProps {
  postId: string;
  comments: any[];
  currentUserId?: string;
}

export default function CommentSection({ postId, comments, currentUserId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error('Please login to comment!');
      setTimeout(() => window.location.href = '/login', 1500);
      return;
    }
    if (!content.trim()) return;

    setIsPending(true);
    const promise = addComment(postId, content);
    toast.promise(promise, {
      loading: 'Posting comment...',
      success: 'Comment added!',
      error: 'Failed to add comment.',
    });
    await promise;
    setContent('');
    setIsPending(false);
  };

  return (
    <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
      {/* Existing Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '800',
              color: 'black',
              flexShrink: 0
            }}>
              {comment.author.name?.charAt(0)}
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '18px', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                {comment.author.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <CollapsibleContent textContent={comment.content} isPlainText maxHeight={100} />
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: '1rem 0' }}>
            No comments yet. Be the first to cheer them on!
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: '800',
          color: 'black',
          flexShrink: 0
        }}>
          {/* Avatar placeholder or user's first letter */}
          U
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            style={{ 
              width: '100%', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '20px', 
              padding: '0.6rem 1rem', 
              color: 'white',
              fontSize: '0.875rem'
            }} 
          />
          <button 
            type="submit" 
            disabled={isPending || !content.trim()}
            style={{ 
              position: 'absolute', 
              right: '8px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: content.trim() ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: content.trim() ? 'pointer' : 'default'
            }}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
