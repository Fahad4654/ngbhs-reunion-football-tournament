'use client';

import UserLink from "@/app/components/UserLink";
import TeamActions from "./team-actions";
import HandoverAction from "./handover-action";
import MemberFilter from "@/app/components/MemberFilter";

interface ManageBatchMembersClientProps {
  members: any[];
  currentUserBatchId: string;
  currentUserId: string;
}

export default function ManageBatchMembersClient({ 
  members, 
  currentUserBatchId, 
  currentUserId 
}: ManageBatchMembersClientProps) {
  return (
    <MemberFilter members={members}>
      {(filteredMembers) => (
        <div className="responsive-table-container glass" style={{ borderRadius: '1rem', overflowX: 'auto', border: 'none', background: 'transparent' }}>
          <table className="sticky-table">
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupation</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }} className="sticky-actions">Actions</th>
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
                        background: member.role === 'BATCH_MANAGER' ? 'var(--accent-secondary)' : 'var(--accent-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'black', 
                        fontWeight: '800', 
                        fontSize: '1rem' 
                      }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', flexWrap: 'wrap' }}>
                          <UserLink user={member} currentUserBatchId={currentUserBatchId} />
                          {member.teamRole && (
                            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', background: 'rgba(235, 183, 0, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(235, 183, 0, 0.3)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '800' }}>{member.teamRole}</span>
                          )}
                          {member.role === 'BATCH_MANAGER' && (
                            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', borderRadius: '4px', textTransform: 'uppercase' }}>Manager</span>
                          )}
                          {member.isPlayer && (
                            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '4px', textTransform: 'uppercase' }}>Player</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {member.occupation || '---'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }} className="sticky-actions">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                      <TeamActions userId={member.id} isPlayer={member.isPlayer} userName={member.name || 'Member'} />
                      {member.id !== currentUserId && member.role === 'USER' && (
                        <HandoverAction userId={member.id} userName={member.name || 'Member'} />
                      )}
                      {member.id === currentUserId && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>You (Current Manager)</span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </MemberFilter>
  );
}
