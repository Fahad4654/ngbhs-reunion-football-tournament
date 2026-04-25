'use client';

import { useState } from 'react';
import { approvePost, rejectPost } from '@/lib/actions';

interface ModerationActionsProps {
  postId: string;
}

export default function ModerationActions({ postId }: ModerationActionsProps) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this post?')) return;
    setIsPending(true);
    await approvePost(postId);
    setIsPending(false);
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this post?')) return;
    setIsPending(true);
    await rejectPost(postId);
    setIsPending(false);
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
