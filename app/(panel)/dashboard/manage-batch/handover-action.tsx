'use client';

import { useState } from 'react';
import { handoverBatchManagerAction } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';

export default function HandoverAction({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);
  const { ask: askConfirm, modal: confirmModal } = useConfirm();
  const router = useRouter();

  const handleHandover = async () => {
    setLoading(true);
    try {
      const result = await handoverBatchManagerAction(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Batch management successfully transferred. You are now a regular user.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const triggerHandover = () => {
    askConfirm(
      'Transfer Batch Manager Role?',
      handleHandover,
      {
        subMessage: `You are about to make ${userName} the Batch Manager. Your own manager role will be revoked and you will become a regular user. This cannot be undone.`,
        confirmLabel: 'Confirm Transfer'
      }
    );
  };

  return (
    <>
      {confirmModal}
      <button
        onClick={triggerHandover}
        disabled={loading}
        className="btn glass"
        style={{
          padding: '0.4rem 0.75rem',
          fontSize: '0.65rem',
          color: 'var(--accent-primary)',
          borderColor: 'var(--border-color)',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'Processing...' : 'Make Manager'}
      </button>
    </>
  );
}
