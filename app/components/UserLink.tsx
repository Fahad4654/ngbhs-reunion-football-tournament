'use client';

import { useState } from 'react';
import UserDetailModal from './UserDetailModal';

interface UserLinkProps {
  user: any;
  currentUserBatchId?: string | null;
  currentUserRole?: string | null;
  style?: React.CSSProperties;
}

export default function UserLink({ user, currentUserBatchId, currentUserRole, style }: UserLinkProps) {
  const [showModal, setShowModal] = useState(false);

  // Anyone can click to see public info
  const canSeeProfile = true;

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <span 
        onClick={handleClick}
        style={{ 
          cursor: canSeeProfile ? 'pointer' : 'default', 
          color: 'var(--accent-primary)',
          fontWeight: '700',
          textDecoration: 'none',
          transition: 'opacity 0.2s ease',
          ...style 
        }}
        onMouseEnter={(e) => {
          if (canSeeProfile) e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          if (canSeeProfile) e.currentTarget.style.opacity = '1';
        }}
      >
        {user.name}
      </span>

      {showModal && (
        <UserDetailModal 
          user={user} 
          onClose={() => setShowModal(false)} 
          isAdmin={currentUserRole === 'ADMIN' || currentUserRole === 'CO_ADMIN'}
          isSameBatch={currentUserBatchId === user.batchId}
        />
      )}
    </>
  );
}
