'use client';

import { useTransition } from 'react';
import { updateMemberRole, toggleTeamMember } from '@/lib/actions/batch.actions';
import { toast } from 'react-hot-toast';
import PersonPinIcon from '@mui/icons-material/PersonPin';

interface OfficialActionsProps {
  userId: string;
  currentRole: string | null;
  userName: string;
}

export default function OfficialActions({ userId, currentRole, userName }: OfficialActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleMakeCoach = () => {
    startTransition(async () => {
      try {
        // Set role to Coach
        const roleResult = await updateMemberRole(userId, 'Coach');
        if (roleResult.success) {
          // Ensure they are NOT in the squad (out of squad requirement)
          await toggleTeamMember(userId, false);
          toast.success(`${userName} is now the Head Coach (Out of Squad)`);
        } else {
          toast.error(roleResult.error || 'Failed to assign coach role');
        }
      } catch (err) {
        toast.error('Something went wrong.');
      }
    });
  };

  const handleRemoveCoach = () => {
    startTransition(async () => {
      try {
        const result = await updateMemberRole(userId, null);
        if (result.success) {
          toast.success(`Removed coach role from ${userName}`);
        } else {
          toast.error(result.error || 'Failed to remove coach role');
        }
      } catch (err) {
        toast.error('Something went wrong.');
      }
    });
  };

  if (currentRole === 'Coach') {
    return (
      <button 
        onClick={handleRemoveCoach} 
        disabled={isPending}
        className="btn glass"
        style={{ 
          fontSize: '0.7rem', 
          padding: '0.3rem 0.6rem', 
          color: 'var(--accent-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}
      >
        <PersonPinIcon sx={{ fontSize: '1rem' }} />
        <span>Remove Coach Role</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleMakeCoach} 
      disabled={isPending}
      className="btn glass"
      style={{ 
        fontSize: '0.7rem', 
        padding: '0.3rem 0.6rem', 
        color: 'var(--accent-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}
    >
      <PersonPinIcon sx={{ fontSize: '1rem' }} />
      <span>Assign as Coach</span>
    </button>
  );
}
