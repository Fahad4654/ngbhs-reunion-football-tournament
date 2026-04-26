'use client';

import { useTransition } from 'react';
import { approveUserAction, rejectUserAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';

export default function ApprovalActions({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this member?')) {
      startTransition(async () => {
        const result = await approveUserAction(userId);
        if (result.success) {
          toast.success('Member approved successfully!');
        } else {
          toast.error(result.error || 'Failed to approve member.');
        }
      });
    }
  };

  const handleReject = () => {
    if (confirm('Are you sure you want to reject this member?')) {
      startTransition(async () => {
        const result = await rejectUserAction(userId);
        if (result.success) {
          toast.success('Member rejected successfully!');
        } else {
          toast.error(result.error || 'Failed to reject member.');
        }
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <button 
        onClick={handleApprove} 
        className="btn" 
        disabled={isPending}
        style={{ 
          background: 'var(--accent-primary)', 
          color: 'black', 
          fontSize: '0.75rem', 
          padding: '0.4rem 0.8rem' 
        }}
      >
        Approve
      </button>
      <button 
        onClick={handleReject} 
        className="btn" 
        disabled={isPending}
        style={{ 
          background: 'var(--accent-danger)', 
          color: 'white', 
          fontSize: '0.75rem', 
          padding: '0.4rem 0.8rem' 
        }}
      >
        Reject
      </button>
    </div>
  );
}
