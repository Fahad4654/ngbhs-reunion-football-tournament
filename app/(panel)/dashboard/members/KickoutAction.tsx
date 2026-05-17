'use client';

import { useState, useTransition, useEffect } from 'react';
import { kickoutMemberAction } from '@/lib/actions/user.actions';
import { toast } from 'react-hot-toast';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { createPortal } from 'react-dom';

interface KickoutActionProps {
  userId: string;
  userName: string;
}

export default function KickoutAction({ userId, userName }: KickoutActionProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKickout = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the kick out.');
      return;
    }

    startTransition(async () => {
      const result = await kickoutMemberAction(userId, reason);
      if (result.success) {
        toast.success(`${userName} has been removed from the batch.`);
        setShowModal(false);
      } else {
        toast.error(result.error || 'Failed to remove member.');
      }
    });
  };

  const modalContent = showModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.25rem'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: '1px solid var(--accent-danger)'
      }}>
        <h3 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem', fontSize: '1.25rem', textAlign: 'center' }}>KICK OUT MEMBER</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Are you sure you want to remove <strong>{userName}</strong> from the batch? This action will restrict their access.
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Reason for Kick Out
          </label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain the reason for misbehave or misconduct..."
            style={{
              width: '100%',
              minHeight: '100px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowModal(false)}
            disabled={isPending}
            className="btn"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleKickout}
            disabled={isPending}
            className="btn"
            style={{ flex: 1, background: 'var(--accent-danger)', color: 'white' }}
          >
            {isPending ? 'Processing...' : 'Confirm Kick Out'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="btn" 
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--accent-danger)', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.75rem', 
          padding: '0.5rem 1rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <RemoveCircleOutlinedIcon sx={{ fontSize: '1.1rem' }} />
        KICK OUT
      </button>

      {mounted && showModal && createPortal(modalContent, document.body)}
    </>
  );
}
