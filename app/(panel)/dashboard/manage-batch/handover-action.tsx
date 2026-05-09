'use client';

import { useState } from 'react';
import { handoverBatchManagerAction } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function HandoverAction({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleHandover = async () => {
    setShowConfirm(false);
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

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
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

      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(235,183,0,0.1)',
              border: '1px solid rgba(235,183,0,0.3)',
              margin: '0 1rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Transfer Batch Manager Role?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                You are about to make <strong style={{ color: 'white' }}>{userName}</strong> the Batch Manager.
                Your own manager role will be revoked and you will become a regular user.
                This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowConfirm(false)} className="btn glass" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handleHandover}
                className="btn"
                style={{ flex: 1, background: 'var(--accent-primary)', color: 'black' }}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
