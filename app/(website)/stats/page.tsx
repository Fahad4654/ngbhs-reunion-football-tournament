import { getTopScorers, getBestGoalkeepers, getBestPlayers, getSeasonAward } from "@/lib/actions/stats.actions";
import Link from "next/link";
import styles from "./stats.module.css";

export const metadata = { title: "Tournament Stats & Awards" };

export default async function StatsPage() {
  const [topScorers, bestGKs, bestPlayers, topTeam, bestEleven] = await Promise.all([
    getTopScorers(10),
    getBestGoalkeepers(10),
    getBestPlayers(10),
    getSeasonAward("TOP_TEAM"),
    getSeasonAward("BEST_ELEVEN")
  ]);

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Tournament Stats & Awards</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Recognizing the standout performances and legends of the NGBHS Reunion Championship.
        </p>
      </div>

      <div className={styles.grid}>
        {/* Top Scorers */}
        <div className={`glass ${styles.card}`}>
          <h2 className={styles.cardTitle}>⚽ Top Scorers</h2>
          <div className={styles.list}>
            {topScorers.length > 0 ? topScorers.map((item: any, i: number) => (
              <div key={item.player.id} className={styles.listItem}>
                <div className={styles.rank}>{i + 1}</div>
                <img src={item.player.image || '/default-avatar.png'} alt={item.player.name || ''} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>{item.player.name}</div>
                  <div className={styles.batch}>{item.player.batch?.name || 'No Batch'}</div>
                </div>
                <div className={styles.stat}>{item.goals}</div>
              </div>
            )) : <p className={styles.empty}>No goals recorded yet.</p>}
          </div>
        </div>

        {/* Best Goalkeepers */}
        <div className={`glass ${styles.card}`}>
          <h2 className={styles.cardTitle}>🧤 Best Goalkeepers</h2>
          <div className={styles.list}>
            {bestGKs.length > 0 ? bestGKs.map((item: any, i: number) => (
              <div key={item.player.id} className={styles.listItem}>
                <div className={styles.rank}>{i + 1}</div>
                <img src={item.player.image || '/default-avatar.png'} alt={item.player.name || ''} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>{item.player.name}</div>
                  <div className={styles.batch}>{item.player.batch?.name || 'No Batch'}</div>
                </div>
                <div className={styles.stat} title="Clean Sheets">{item.cleanSheets} <span style={{fontSize:'0.8rem'}}>CS</span></div>
              </div>
            )) : <p className={styles.empty}>No clean sheets recorded yet.</p>}
          </div>
        </div>

        {/* Best Players */}
        <div className={`glass ${styles.card}`}>
          <h2 className={styles.cardTitle}>⭐ Best Players (All-Round)</h2>
          <div className={styles.list}>
            {bestPlayers.length > 0 ? bestPlayers.map((item: any, i: number) => (
              <div key={item.player.id} className={styles.listItem}>
                <div className={styles.rank}>{i + 1}</div>
                <img src={item.player.image || '/default-avatar.png'} alt={item.player.name || ''} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>{item.player.name}</div>
                  <div className={styles.batch}>{item.player.batch?.name || 'No Batch'}</div>
                </div>
                <div className={styles.stat} title="Points">{item.stats.total} <span style={{fontSize:'0.8rem'}}>Pts</span></div>
              </div>
            )) : <p className={styles.empty}>No stats recorded yet.</p>}
          </div>
        </div>
      </div>

      {/* Season Awards */}
      <div style={{ marginTop: '5rem' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Curated Teams</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Top Team */}
          {topTeam && topTeam.players.length > 0 && (
            <div className={`glass ${styles.card}`}>
              <h2 className={styles.cardTitle} style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>{topTeam.title}</h2>
              {topTeam.description && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{topTeam.description}</p>}
              
              {(topTeam.coach || topTeam.captain) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {topTeam.coach && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Coach</div>
                      <div style={{ fontWeight: 'bold' }}>{topTeam.coach.name}</div>
                    </div>
                  )}
                  {topTeam.captain && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Captain</div>
                      <div style={{ fontWeight: 'bold' }}>{topTeam.captain.name}</div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.squadList}>
                {topTeam.players.map((p: any) => (
                  <div key={p.id} className={styles.squadItem}>
                    <img src={p.image || '/default-avatar.png'} alt={p.name || ''} className={styles.avatarSmall} />
                    <div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.batch}>{p.batch?.name || p.teamRole || 'Player'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Eleven */}
          {bestEleven && bestEleven.players.length > 0 && (
            <div className={`glass ${styles.card}`}>
              <h2 className={styles.cardTitle} style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>{bestEleven.title}</h2>
              {bestEleven.description && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{bestEleven.description}</p>}
              
              {(bestEleven.coach || bestEleven.captain) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {bestEleven.coach && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Coach</div>
                      <div style={{ fontWeight: 'bold' }}>{bestEleven.coach.name}</div>
                    </div>
                  )}
                  {bestEleven.captain && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Captain</div>
                      <div style={{ fontWeight: 'bold' }}>{bestEleven.captain.name}</div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.squadList}>
                {bestEleven.players.map((p: any) => (
                  <div key={p.id} className={styles.squadItem}>
                    <img src={p.image || '/default-avatar.png'} alt={p.name || ''} className={styles.avatarSmall} />
                    <div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.batch}>{p.batch?.name || p.teamRole || 'Player'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
