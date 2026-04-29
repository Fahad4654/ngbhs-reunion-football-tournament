'use client';

import { useState } from 'react';
import { approvePost, rejectPost } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface ModerationActionsProps {
  postId: string;
}

export default function ModerationActions({ postId }: ModerationActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, message: '', onConfirm: null });

  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, message: '', onConfirm: null });
  };

  const handleApprove = () => {
    confirmAction('Are you sure you want to approve this post?', async () => {
      setIsPending(true);
      const promise = approvePost(postId);
      toast.promise(promise, {
        loading: 'Approving...',
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
    <>
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

      {confirmState.isOpen && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
          onClick={closeConfirm}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem', 
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(235, 183, 0, 0.1)',
              border: '1px solid rgba(235, 183, 0, 0.3)',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              margin: '0 1rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                margin: 0, 
                fontWeight: '600', 
                fontSize: '1.25rem', 
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {confirmState.message}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={closeConfirm}
                className="btn glass"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  closeConfirm();
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Confirm
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9) translateY(10px); }
              to { transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}
