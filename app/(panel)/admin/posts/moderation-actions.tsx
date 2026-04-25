'use client';

import { useState } from 'react';
import { approvePost, rejectPost } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface ModerationActionsProps {
  postId: string;
}

export default function ModerationActions({ postId }: ModerationActionsProps) {
  const [isPending, setIsPending] = useState(false);

  const confirmAction = (message: string, onConfirm: () => void) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="btn glass"
            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
          >
            Confirm
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const handleApprove = () => {
    confirmAction('Are you sure you want to approve this post?', async () => {
      setIsPending(true);
      const promise = approvePost(postId);
      toast.promise(promise, {
        loading: 'Approving...',
        success: 'Post approved! 🚀',
        error: 'Failed to approve post.',
      });
      await promise;
      setIsPending(false);
    });
  };

  const handleReject = () => {
    confirmAction('Are you sure you want to reject this post?', async () => {
      setIsPending(true);
      const promise = rejectPost(postId);
      toast.promise(promise, {
        loading: 'Rejecting...',
        success: 'Post rejected.',
        error: 'Failed to reject post.',
      });
      await promise;
      setIsPending(false);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        onClick={handleApprove} 
        className="btn btn-primary" 
        style={{ flex: 1 }} 
        disabled={isPending}
      >
        {isPending ? 'Processing...' : 'Approve Post'}
      </button>
      <button 
        onClick={handleReject} 
        className="btn glass" 
        style={{ flex: 1, color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }} 
        disabled={isPending}
      >
        {isPending ? 'Processing...' : 'Reject Post'}
      </button>
    </div>
  );
}
