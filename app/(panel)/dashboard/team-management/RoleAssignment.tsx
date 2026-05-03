'use client';

import { useState, useTransition } from 'react';
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

export default function RoleAssignment({ userId, currentRole, userName }: RoleAssignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(currentRole || '');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateMemberRole(userId, role);
      if (result.success) {
        toast.success(`Role updated for ${userName}`);
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update role');
      }
    });
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Captain"
          className="glass"
          style={{ 
            fontSize: '0.75rem', 
            padding: '0.3rem 0.6rem', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            width: '100px'
          }}
          autoFocus
        />
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
