'use client';

import { useState } from 'react';
import { approvePost, rejectPost } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';

interface ModerationActionsProps {
  postId: string;
}

export default function ModerationActions({ postId }: ModerationActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  const handleApprove = () => {
    askConfirm('Are you sure you want to approve this post?', async () => {
      setIsPending(true);
      const promise = approvePost(postId);
      toast.promise(promise, {
        loading: 'Approving...',
        error: 'Failed to approve post.',
      });
      await promise;
      setIsPending(false);
    }, { danger: false, confirmLabel: 'Approve' });
  };

  const handleReject = () => {
    askConfirm('Are you sure you want to reject this post?', async () => {
      setIsPending(true);
      const promise = rejectPost(postId);
      toast.promise(promise, {
        loading: 'Rejecting...',
        success: 'Post rejected.',
        error: 'Failed to reject post.',
      });
      await promise;
      setIsPending(false);
    }, { danger: true, confirmLabel: 'Reject' });
  };

  return (
    <>
      {confirmModal}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleApprove} 
          className="btn btn-primary" 
          style={{ flex: 1, padding: '1rem', fontWeight: '800' }} 
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'APPROVE POST'}
        </button>
        <button 
          onClick={handleReject} 
          className="btn glass" 
          style={{ flex: 1, color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', padding: '1rem', fontWeight: '800' }} 
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'REJECT POST'}
        </button>
      </div>
    </>
  );
}
