'use client';

import { useState } from 'react';
import UserDetailModal from '@/app/components/UserDetailModal';
import UserLink from '@/app/components/UserLink';
import SearchIcon from '@mui/icons-material/Search';

import MemberFilter from '@/app/components/MemberFilter';
import KickoutAction from './KickoutAction';

interface MemberDirectoryProps {
  members: any[];
  currentUserBatchId: string;
  currentUserRole?: string;
  currentUserId?: string;
}

export default function MemberDirectory({ members, currentUserBatchId, currentUserRole, currentUserId }: MemberDirectoryProps) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const isManager = currentUserRole === 'BATCH_MANAGER' || currentUserRole === 'ADMIN';

  return (
    <>
    <MemberFilter members={members}>
      {(filteredMembers) => (
        <div className="responsive-table-container glass" style={{ borderRadius: '1rem', overflowX: 'auto', border: 'none', background: 'transparent' }}>
          <table className="sticky-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional</th>
                {isManager && (
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }} className="sticky-actions">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: member.image ? 'transparent' : 'var(--accent-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'black', 
                        fontWeight: '800', 
                        fontSize: '1rem',
                        overflow: 'hidden',
                        border: member.image ? '1px solid var(--border-color)' : 'none'
                      }}>
                        {member.image ? (
                          <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          member.name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                          <UserLink user={member} currentUserBatchId={currentUserBatchId} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {member.teamRole ? (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.2rem 0.5rem', 
                        background: 'rgba(235, 183, 0, 0.1)', 
                        color: 'var(--accent-primary)', 
                        border: '1px solid rgba(235, 183, 0, 0.2)', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '800'
                      }}>
                        {member.teamRole}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.isPlayer ? 'Player' : 'Member'}</span>
                    )}
                    {member.role === 'BATCH_MANAGER' && (
                       <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', borderRadius: '4px', textTransform: 'uppercase', marginLeft: '0.5rem' }}>Manager</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.occupation || '---'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.workplace}</div>
                  </td>
                  {isManager && (
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }} className="sticky-actions">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                        {member.id !== currentUserId && member.role === 'USER' && (
                          <KickoutAction userId={member.id} userName={member.name || 'Member'} />
                        )}
                        {member.id === currentUserId && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>You</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={isManager ? 4 : 3} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </MemberFilter>

      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </>
  );
}
