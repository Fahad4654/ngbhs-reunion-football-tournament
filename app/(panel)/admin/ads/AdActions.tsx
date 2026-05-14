'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { deleteAd, toggleAdStatus } from '@/lib/actions/ad.actions';
import { useConfirm } from '@/app/components/ConfirmModal';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface AdActionsProps {
  id: string;
  isActive: boolean;
}

export default function AdActions({ id, isActive }: AdActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  const handleToggle = async () => {
    setIsPending(true);
    const res = await toggleAdStatus(id, isActive);
    setIsPending(false);

    if (res.success) {
      toast.success(isActive ? 'Ad deactivated' : 'Ad activated');
    } else {
      toast.error(res.error || 'Failed to toggle status');
    }
  };

  const handleDelete = () => {
    askConfirm('Are you sure you want to delete this advertisement?', async () => {
      setIsPending(true);
      const res = await deleteAd(id);
      setIsPending(false);

      if (res.success) {
        toast.success('Advertisement deleted');
      } else {
        toast.error(res.error || 'Failed to delete advertisement');
      }
    });
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleToggle}
          disabled={isPending}
          className="btn glass"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          title={isActive ? 'Deactivate' : 'Activate'}
        >
          <PowerSettingsNewIcon sx={{ fontSize: '1.2rem' }} />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="btn glass"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)' }}
          title="Delete"
        >
          <DeleteIcon sx={{ fontSize: '1.2rem' }} />
        </button>
      </div>
      {confirmModal}
    </>
  );
}
