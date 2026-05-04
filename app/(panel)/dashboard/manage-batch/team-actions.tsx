'use client';

import { useTransition } from 'react';
import { toggleTeamMember } from '@/lib/actions';
import { toast } from 'react-hot-toast';

export default function TeamActions({ userId, isPlayer, userName }: { userId: string, isPlayer: boolean, userName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const actionText = isPlayer ? 'remove from team' : 'add to team';
    if (confirm(`Are you sure you want to ${actionText} ${userName}?`)) {
      startTransition(async () => {
        const result = await toggleTeamMember(userId, !isPlayer);
        if (result.success) {
          toast.success(`Successfully ${isPlayer ? 'removed from' : 'added to'} team!`);
        } else {
          toast.error(result.error || 'Failed to update team status.');
        }
      });
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      className="btn" 
      disabled={isPending}
      style={{ 
        background: isPlayer ? 'var(--accent-danger)' : 'var(--accent-primary)', 
        color: isPlayer ? 'white' : 'black', 
        fontSize: '0.75rem', 
        padding: '0.5rem 1rem',
        fontWeight: '700',
        whiteSpace: 'nowrap'
      }}
    >
      {isPending ? 'Updating...' : isPlayer ? 'Remove from Team' : 'Add to Team'}
    </button>
  );
}
