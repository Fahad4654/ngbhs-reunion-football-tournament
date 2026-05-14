'use client';

import { useState } from 'react';
import UserDetailModal from '@/app/components/UserDetailModal';
import UserLink from '@/app/components/UserLink';
import SearchIcon from '@mui/icons-material/Search';

import MemberFilter from '@/app/components/MemberFilter';

interface MemberDirectoryProps {
  members: any[];
  currentUserBatchId: string;
}

export default function MemberDirectory({ members, currentUserBatchId }: MemberDirectoryProps) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  return (
    <>
    <MemberFilter members={members}>
      {(filteredMembers) => (
        <div className="responsive-table-container glass" style={{ borderRadius: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }} className="hover-row">
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
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.occupation || '---'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.workplace}</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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

      <style jsx>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </>
  );
}
