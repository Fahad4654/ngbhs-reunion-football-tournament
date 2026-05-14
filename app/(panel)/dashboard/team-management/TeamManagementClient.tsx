'use client';

import UserLink from "@/app/components/UserLink";
import TeamActions from "../manage-batch/team-actions";
import RoleAssignment from "./RoleAssignment";
import DesignationAssignment from "./DesignationAssignment";
import MemberFilter from "@/app/components/MemberFilter";

interface TeamManagementClientProps {
  members: any[];
  batchId: string;
}

export default function TeamManagementClient({ members, batchId }: TeamManagementClientProps) {
  return (
    <MemberFilter members={members}>
      {(filteredMembers) => {
        const players = filteredMembers.filter(m => m.isPlayer);
        const nonPlayers = filteredMembers.filter(m => !m.isPlayer);

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Squad List */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>SQUAD LIST ({players.length})</h3>
              </div>
              <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                {players.length > 0 ? players.map((player) => (
                  <div key={player.id} style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                          {player.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserLink user={player} currentUserBatchId={batchId} />
                            {player.teamRole && (
                              <span style={{ 
                                fontSize: '0.6rem', 
                                padding: '0.1rem 0.4rem', 
                                background: 'rgba(235, 183, 0, 0.1)', 
                                color: 'var(--accent-primary)', 
                                border: '1px solid rgba(235, 183, 0, 0.3)', 
                                borderRadius: '4px',
                                fontWeight: '800',
                                textTransform: 'uppercase'
                              }}>
                                {player.teamRole}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.occupation || 'Player'}</div>
                        </div>
                      </div>
                      <TeamActions userId={player.id} isPlayer={true} userName={player.name || 'Player'} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <RoleAssignment userId={player.id} currentRole={player.teamRole} userName={player.name || 'Player'} />
                      <DesignationAssignment userId={player.id} currentDesignation={player.teamDesignation} userName={player.name || 'Player'} />
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No players found.
                  </div>
                )}
              </div>
            </section>

            {/* Available Members */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-secondary)', margin: 0 }}>AVAILABLE MEMBERS ({nonPlayers.length})</h3>
              </div>
              <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                {nonPlayers.length > 0 ? nonPlayers.map((member) => (
                  <div key={member.id} style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                          {member.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserLink user={member} currentUserBatchId={batchId} />
                            {member.teamRole && (
                              <span style={{ 
                                fontSize: '0.6rem', 
                                padding: '0.1rem 0.4rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-secondary)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '4px',
                                fontWeight: '800',
                                textTransform: 'uppercase'
                              }}>
                                {member.teamRole}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.occupation || 'Member'}</div>
                        </div>
                      </div>
                      <TeamActions userId={member.id} isPlayer={false} userName={member.name || 'Member'} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <RoleAssignment userId={member.id} currentRole={member.teamRole} userName={member.name || 'Member'} />
                      <DesignationAssignment userId={member.id} currentDesignation={member.teamDesignation} userName={member.name || 'Member'} />
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No other members found.
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      }}
    </MemberFilter>
  );
}
