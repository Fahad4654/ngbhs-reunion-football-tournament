import prisma from "@/lib/prisma";
import styles from "./matches.module.css";

async function getMatches() {
  return await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
}

export default async function MatchesPage() {
  const matches = await getMatches();

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

        <div className={styles.matchList}>
          {matches.length > 0 ? matches.map((match) => (
            <div key={match.id} className={`${styles.matchCard} glass`}>
              {/* Home Team */}
              <div className={`${styles.team} ${styles.teamHome}`}>
                <span className={styles.teamName}>{match.homeTeam.name}</span>
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
                    <span className="badge badge-live">LIVE</span>
                  ) : (
                    <span>{match.status}</span>
                  )}
                </div>
                <div className={styles.scoreBox}>
                  {match.status === 'SCHEDULED' ? (
                    <span style={{ fontSize: 'clamp(1rem, 1.2vw, 1.2rem)' }}>VS</span>
                  ) : (
                    `${match.homeScore} - ${match.awayScore}`
                  )}
                </div>
                <div className={styles.venue}>
                  {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {match.venue || 'TBD'}
                </div>
              </div>

              {/* Away Team */}
              <div className={`${styles.team} ${styles.teamAway}`}>
                <div className={styles.teamLogo}>
                  {match.awayTeam.logoUrl && (
                    <img src={match.awayTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                </div>
                <span className={styles.teamName}>{match.awayTeam.name}</span>
              </div>
            </div>
          )) : (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches have been scheduled yet. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
