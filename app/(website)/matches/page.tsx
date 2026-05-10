import prisma from "@/lib/prisma";
import styles from "./matches.module.css";
import Link from "next/link";
import ShieldIcon from '@mui/icons-material/Shield';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

async function getMatches() {
  return await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      manOfTheMatch: { select: { name: true } },
      events: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      date: 'desc',
    },
  });
}

export default async function MatchesPage() {
  const matches = await getMatches();

  const STAGE_ORDER = ["FINAL", "THIRD_PLACE", "SEMI_FINAL", "QUARTER_FINAL", "ROUND_OF_16", "ROUND_OF_32", "GROUP_STAGE"];

  const groupedMatches = STAGE_ORDER.map(stage => ({
    stage,
    matches: matches.filter(m => (m.stage || "GROUP_STAGE") === stage)
  })).filter(group => group.matches.length > 0);

  return (
    <div className="container">
      <section className={styles.section}>
        <div style={{ marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
          <h1 className="text-gradient" style={{ 
            fontSize: 'clamp(2.25rem, 8vw, 4rem)', 
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            TOURNAMENT <br/>FIXTURES & RESULTS
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            maxWidth: '600px',
            fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
            lineHeight: 1.6
          }}>
            Stay updated with every match. From intense group stages to the grand finale, track all the action here.
          </p>
        </div>

        {groupedMatches.length > 0 ? groupedMatches.map((group) => (
          <div key={group.stage} style={{ marginBottom: '4rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '2rem',
              padding: '0.5rem 1rem',
              background: 'rgba(235,183,0,0.05)',
              borderLeft: '4px solid var(--accent-primary)',
              borderRadius: '4px'
            }}>
              <h2 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '900', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                margin: 0,
                color: 'var(--accent-primary)'
              }}>
                {group.stage.replace(/_/g, " ")}
              </h2>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            </div>

            <div className={styles.matchList}>
              {group.matches.map((match) => (
                <Link key={match.id} href={`/matches/${match.id}`} className={`${styles.matchCard} glass`} style={{ textDecoration: 'none', color: 'inherit', display: 'grid' }}>
                  {/* Home Team */}
                  <div className={`${styles.team} ${styles.teamHome}`}>
                    <span className={styles.teamName}>
                      {match.homeTeam.name}
                      {match.homeCleanSheet && <ShieldIcon sx={{ fontSize: '0.9rem', color: '#60a5fa', verticalAlign: 'middle', ml: 0.5 }} />}
                    </span>
                    <div className={styles.teamLogo}>
                      {match.homeTeam.logoUrl && (
                        <img src={match.homeTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                    </div>
                  </div>

                  {/* Score / Time */}
                  <div className={styles.scoreContainer}>
                    <div className={styles.status}>
                      {match.status === 'LIVE' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                          <span className="badge badge-live">LIVE</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--accent-danger)' }}>
                            {match.currentMinute}'{match.injuryTime > 0 ? ` +${match.injuryTime}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{match.status}</span>
                      )}
                    </div>
                    <div className={styles.scoreBox} style={{ fontSize: '2rem', fontWeight: '950', letterSpacing: '-0.02em' }}>
                      {match.status === 'SCHEDULED' ? (
                        <span style={{ fontSize: 'clamp(1rem, 1.2vw, 1.2rem)', color: 'var(--text-muted)' }}>VS</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span>{match.homeScore}</span>
                            <span style={{ opacity: 0.3 }}>-</span>
                            <span>{match.awayScore}</span>
                          </div>
                          {(match.homePenaltyScore > 0 || match.awayPenaltyScore > 0) && (
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                              ({match.homePenaltyScore} - {match.awayPenaltyScore} Pen)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.venue}>
                      <div style={{ marginBottom: '0.2rem' }}>
                        {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {match.venue || 'TBD'}
                      </div>
                      {match.manOfTheMatch && (
                        <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.75rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                          <EmojiEventsIcon sx={{ fontSize: '1rem' }} /> MOTM: {match.manOfTheMatch.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className={`${styles.team} ${styles.teamAway}`}>
                    <div className={styles.teamLogo}>
                      {match.awayTeam.logoUrl && (
                        <img src={match.awayTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <span className={styles.teamName}>
                      {match.awayCleanSheet && <ShieldIcon sx={{ fontSize: '0.9rem', color: '#60a5fa', verticalAlign: 'middle', mr: 0.5 }} />}
                      {match.awayTeam.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matches have been scheduled yet. Check back soon!
          </div>
        )}
      </section>
    </div>
  );
}
