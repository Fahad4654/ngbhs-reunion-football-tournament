'use client';

import { useState, useTransition } from 'react';
import { updateJerseyNumberAction } from '@/lib/actions/user.actions';
import { toast } from 'react-hot-toast';

interface JerseyNumberActionProps {
  userId: string;
  initialJerseyNumber: string | null;
}

export default function JerseyNumberAction({ userId, initialJerseyNumber }: JerseyNumberActionProps) {
  const [isPending, startTransition] = useTransition();
  const [jersey, setJersey] = useState(initialJerseyNumber || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateJerseyNumberAction(userId, jersey);
      if (result.success) {
        toast.success('Jersey number updated!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update jersey number.');
      }
    });
  };

  if (!isEditing) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        style={{ 
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px dashed rgba(255,255,255,0.2)',
          minWidth: '40px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: jersey ? 'var(--accent-primary)' : 'var(--text-muted)'
        }}
      >
        {jersey || '--'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      <input 
        type="text"
        value={jersey}
        onChange={(e) => setJersey(e.target.value)}
        placeholder="#"
        style={{
          width: '50px',
          padding: '0.25rem',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '4px',
          color: 'white',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}
        autoFocus
      />
      <button 
        onClick={handleSave}
        disabled={isPending}
        className="btn"
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.7rem',
          background: 'var(--accent-primary)',
          color: 'black'
        }}
      >
        {isPending ? '...' : 'Save'}
      </button>
      <button 
        onClick={() => {
          setIsEditing(false);
          setJersey(initialJerseyNumber || '');
        }}
        disabled={isPending}
        className="btn"
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.7rem',
          background: 'rgba(255,255,255,0.1)',
          color: 'white'
        }}
      >
        X
      </button>
    </div>
  );
}
