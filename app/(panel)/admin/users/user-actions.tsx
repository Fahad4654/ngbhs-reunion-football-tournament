'use client';

import { useState } from 'react';
import { updateUserRoleAction, deleteUserAction, updateCommitteeStatus, updateVolunteerStatus } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';
import CustomSelect from '@/app/components/panel/CustomSelect';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import DeleteIcon from '@mui/icons-material/Delete';

interface UserActionsProps {
  userId: string;
  currentRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'ADMIN' | 'SCORER';
  isCommitteeMember: boolean;
  committeeRole: string;
  isVolunteer: boolean;
}

export default function UserActions({ 
  userId, 
  currentRole, 
  isCommitteeMember, 
  committeeRole: initialCommitteeRole, 
  isVolunteer 
}: UserActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [showOrgSettings, setShowOrgSettings] = useState(false);
  const [committeeRole, setCommitteeRole] = useState(initialCommitteeRole);
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

  const handleToggleCommittee = async () => {
    const newStatus = !isCommitteeMember;
    let role = committeeRole;
    
    if (newStatus && !role) {
      const input = window.prompt("Enter Committee Role (e.g. President, Member):");
      if (input === null) return;
      role = input;
      setCommitteeRole(role);
    }

    setIsPending(true);
    const res = await updateCommitteeStatus(userId, newStatus, role);
    setIsPending(false);

    if (res.success) {
      toast.success(newStatus ? 'Added to Committee' : 'Removed from Committee');
    } else {
      toast.error(res.error || 'Failed to update committee status');
    }
  };

  const handleToggleVolunteer = async () => {
    setIsPending(true);
    const res = await updateVolunteerStatus(userId, !isVolunteer);
    setIsPending(false);

    if (res.success) {
      toast.success(!isVolunteer ? 'Designated as Volunteer' : 'Removed Volunteer status');
    } else {
      toast.error(res.error || 'Failed to update volunteer status');
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
        {/* Committee Toggle */}
        <button
          onClick={handleToggleCommittee}
          disabled={isPending}
          title={isCommitteeMember ? `Committee Member (${committeeRole})` : "Add to Committee"}
          className="btn glass"
          style={{ 
            padding: '0.4rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isCommitteeMember ? 'rgba(235, 183, 0, 0.2)' : 'transparent',
            borderColor: isCommitteeMember ? 'var(--accent-primary)' : 'var(--border-color)',
            color: isCommitteeMember ? 'var(--accent-primary)' : 'var(--text-muted)'
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: '1.2rem' }} />
        </button>

        {/* Volunteer Toggle */}
        <button
          onClick={handleToggleVolunteer}
          disabled={isPending}
          title={isVolunteer ? "Volunteer" : "Add as Volunteer"}
          className="btn glass"
          style={{ 
            padding: '0.4rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isVolunteer ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderColor: isVolunteer ? '#22c55e' : 'var(--border-color)',
            color: isVolunteer ? '#22c55e' : 'var(--text-muted)'
          }}
        >
          <VolunteerActivismIcon sx={{ fontSize: '1.2rem' }} />
        </button>

        {currentRole !== 'ADMIN' && (
          <div style={{ width: '140px' }}>
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
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <DeleteIcon sx={{ fontSize: '1rem' }} />
          Delete
        </button>
      </div>

      {confirmModal}
    </>
  );
}
