'use client';

import { useState } from 'react';
import { handoverBatchManagerAction } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';

export default function HandoverAction({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleHandover = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to make ${userName} the Batch Manager?\n\nIMPORTANT: Your own manager role will be revoked and you will become a normal user. You will no longer be able to manage this batch.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await handoverBatchManagerAction(userId);
      if (result.error) {
        alert(result.error);
      } else {
        alert('Batch management successfully transferred. You are now a normal user.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleHandover}
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
  );
}
