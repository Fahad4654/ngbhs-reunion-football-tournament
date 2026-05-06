'use client';

import { useState } from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface UserActionsProps {
  userId: string;
  currentRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'ADMIN' | 'SCORER';
}

export default function UserActions({ userId, currentRole }: UserActionsProps) {
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

  const handleRoleChange = async (newRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'SCORER') => {
    setIsPending(true);
    const promise = updateUserRoleAction(userId, newRole).then(res => {
      if (res.error) throw new Error(res.error);
      return res;
    });

    toast.promise(promise, {
      loading: 'Updating role...',
      success: `User role updated to ${newRole}.`,
      error: (err) => err.message || 'Failed to update role.',
    });

    try {
      await promise;
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = () => {
    confirmAction('Are you sure you want to completely delete this user? All their posts and media will be removed. This cannot be undone.', async () => {
      setIsPending(true);
      const promise = deleteUserAction(userId).then(res => {
        if (res.error) throw new Error(res.error);
        return res;
      });

      toast.promise(promise, {
        loading: 'Deleting user and their data...',
        success: 'User successfully deleted.',
        error: (err) => err.message || 'Failed to delete user.',
      });

      try {
        await promise;
      } finally {
        setIsPending(false);
      }
    });
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        {currentRole !== 'ADMIN' && (
          <select 
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value as 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'SCORER')}
            disabled={isPending}
            className="glass"
            style={{ 
              padding: '0.4rem 1.5rem 0.4rem 0.8rem', 
              fontSize: '0.7rem', 
              background: 'rgba(255,255,255,0.05) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E") no-repeat right 0.25rem center / 1rem', 
              color: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
              fontWeight: '600'
            }}
          >
            <option value="USER" style={{ color: 'black' }}>Role: User</option>
            <option value="BATCH_MANAGER" style={{ color: 'black' }}>Role: Batch Manager</option>
            <option value="SCORER" style={{ color: 'black' }}>Role: Scorer</option>
            <option value="CO_ADMIN" style={{ color: 'black' }}>Role: Co-Admin</option>
          </select>
        )}
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="btn glass" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)' }}
        >
          Delete
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
              maxWidth: '450px',
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
                className="btn"
                style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none' }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
