'use client';

import { useTransition } from 'react';
import { toggleTeamMember } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';

export default function TeamActions({ userId, isPlayer, userName }: { userId: string, isPlayer: boolean, userName: string }) {
  const [isPending, startTransition] = useTransition();
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  const handleToggle = () => {
    const actionText = isPlayer ? 'Remove from Team' : 'Add to Team';
    askConfirm(
      `${actionText}: ${userName}?`,
      () => {
        startTransition(async () => {
          const result = await toggleTeamMember(userId, !isPlayer);
          if (result.success) {
            toast.success(`Successfully ${isPlayer ? 'removed from' : 'added to'} team!`);
          } else {
            toast.error(result.error || 'Failed to update team status.');
          }
        });
      },
      { danger: isPlayer, confirmLabel: actionText }
    );
  };

  return (
    <>
      {confirmModal}
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
    </>
  );
}
