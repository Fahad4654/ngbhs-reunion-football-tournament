'use client';

import { useState } from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';
import CustomSelect from '@/app/components/panel/CustomSelect';

interface UserActionsProps {
  userId: string;
  currentRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'ADMIN' | 'SCORER';
}

export default function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const { ask: askConfirm, modal: confirmModal } = useConfirm();



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
    askConfirm('Are you sure you want to completely delete this user?', async () => {
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
    }, { subMessage: 'All their posts and media will be removed. This cannot be undone.', confirmLabel: 'Delete User' });
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        {currentRole !== 'ADMIN' && (
          <div style={{ width: '160px' }}>
            <CustomSelect 
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'SCORER')}
              disabled={isPending}
              style={{ 
                padding: '0.4rem 2rem 0.4rem 0.7rem',
                fontSize: '0.75rem',
                height: 'auto'
              }}
            >
              <option value="USER">User</option>
              <option value="BATCH_MANAGER">Batch Manager</option>
              <option value="SCORER">Scorer</option>
              <option value="CO_ADMIN">Co-Admin</option>
            </CustomSelect>
          </div>
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

      {confirmModal}
    </>
  );
}
