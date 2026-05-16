'use client';
 
import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMemberDesignation } from '@/lib/actions/batch.actions';
import { toast } from 'react-hot-toast';
import StarsIcon from '@mui/icons-material/Stars';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface DesignationAssignmentProps {
  userId: string;
  currentDesignation: string | null;
  userName: string;
}

const TEAM_DESIGNATIONS = [
  'Captain',
  'Vice-Captain',
  'Substitute',
];

export default function DesignationAssignment({ userId, currentDesignation, userName }: DesignationAssignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [designation, setDesignation] = useState(currentDesignation || '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setDesignation(currentDesignation || '');
  }, [currentDesignation]);

  const handleSave = () => {
    if (designation === currentDesignation) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateMemberDesignation(userId, designation || null);
        if (result.success) {
          toast.success(`Designation updated for ${userName}`);
          setIsEditing(false);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update designation');
        }
      } catch (err: any) {
        console.error('Designation update error:', err);
        toast.error('Network error. Please try again.');
      }
    });
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          style={{ width: '140px', fontSize: '0.8rem' }}
          autoFocus
        >
          <option value="" style={{ color: 'black' }}>— No Designation —</option>
          {TEAM_DESIGNATIONS.map((d) => (
            <option key={d} value={d} style={{ color: 'black' }}>{d}</option>
          ))}
        </select>
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className="btn glass"
          style={{ padding: '0.3rem', minWidth: 'auto', color: 'var(--accent-primary)' }}
        >
          <SaveIcon sx={{ fontSize: '1rem' }} />
        </button>
        <button 
          onClick={() => { setIsEditing(false); setDesignation(currentDesignation || ''); }}
          className="btn glass"
          style={{ padding: '0.3rem', minWidth: 'auto', color: '#ff4444' }}
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      className="btn glass"
      style={{ 
        fontSize: '0.7rem', 
        padding: '0.3rem 0.6rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.3rem',
        opacity: 0.8,
        height: 'auto',
        color: currentDesignation ? 'var(--accent-secondary)' : 'inherit'
      }}
    >
      <StarsIcon sx={{ fontSize: '0.9rem' }} />
      <span>{currentDesignation || 'Add Designation'}</span>
    </button>
  );
}
