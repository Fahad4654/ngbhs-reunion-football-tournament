'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMemberRole } from '@/lib/actions/batch.actions';
import { toast } from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface RoleAssignmentProps {
  userId: string;
  currentRole: string | null;
  userName: string;
}

const FOOTBALL_ROLES = [
  { group: 'Goalkeeper', roles: ['Goalkeeper (GK)'] },
  { group: 'Defenders', roles: ['Center-Back (CB)', 'Full-Back (LB/RB)', 'Wing-Back (LWB/RWB)', 'Sweeper (SW)'] },
  { group: 'Midfielders', roles: ['Central Defensive Midfielder (CDM)', 'Central Midfielder (CM)', 'Central Attacking Midfielder (CAM)', 'Wide Midfielder (LM/RM)', 'Deep-Lying Playmaker (Regista)'] },
  { group: 'Forwards', roles: ['Winger (LW/RW)', 'Center-Forward (CF)', 'Striker (ST)', 'Second Striker (SS)', 'False 9'] },
];

export default function RoleAssignment({ userId, currentRole, userName }: RoleAssignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(currentRole || '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Update internal state if prop changes from parent
  useEffect(() => {
    setRole(currentRole || '');
  }, [currentRole]);

  const handleSave = () => {
    if (role === currentRole) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateMemberRole(userId, role || null);
        if (result.success) {
          toast.success(`Role updated for ${userName}`);
          setIsEditing(false);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update role');
        }
      } catch (err: any) {
        console.error('Role update error:', err);
        toast.error('Network error. Please try again.');
      }
    });
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '180px', fontSize: '0.8rem' }}
          autoFocus
        >
          <option value="" style={{ color: 'black' }}>— None —</option>
          {FOOTBALL_ROLES.map((group) => (
            <optgroup key={group.group} label={group.group} style={{ color: 'black', fontWeight: 'bold' }}>
              {group.roles.map((r) => (
                <option key={r} value={r} style={{ color: 'black' }}>{r}</option>
              ))}
            </optgroup>
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
          onClick={() => { setIsEditing(false); setRole(currentRole || ''); }}
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
        height: 'auto'
      }}
    >
      <EditIcon sx={{ fontSize: '0.9rem' }} />
      <span>{currentRole ? 'Change Role' : 'Assign Role'}</span>
    </button>
  );
}
