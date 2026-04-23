import prisma from "@/lib/prisma";
import styles from "./page.module.css";

async function getMatches() {
  return await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 6,
  });
}

async function getNews() {
  return await prisma.news.findMany({
    orderBy: {
      publishedAt: 'desc',
    },
    take: 3,
  });
}

async function getStandings() {
  const batches = await prisma.batch.findMany({
    orderBy: [
      { points: 'desc' },
      { goalsFor: 'desc' },
    ],
    take: 5,
  });
  return batches;
}

export default async function Home() {
  const [matches, news, standings] = await Promise.all([
    getMatches(),
    getNews(),
    getStandings(),
  ]);

  const featuredMatch = matches.find(m => m.isFeatured) || matches[0];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.blob} style={{ top: '-100px', left: '-100px' }}></div>
          <div className={styles.blob} style={{ bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%)' }}></div>
        </div>
        
        <div className={`${styles.heroContent} container`}>
          <div className={styles.heroBadge}>Season 2026 • Official Webapp</div>
          <h1 className={styles.heroTitle}>NGBHS REUNION <br/><span className="text-gradient">FOOTBALL TOURNAMENT</span></h1>
          <p className={styles.heroSubtitle}>
            Experience the thrill of the reunion. Tracking live scores, exclusive news, and every memorable goal from all school batches.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary">View Fixtures</button>
            <button className="btn glass" style={{ border: '1px solid var(--border-color)' }}>Batch Standings</button>
          </div>
        </div>
      </section>

      {/* Live Scoreboard Section */}
      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <div>
            <div style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current Action</div>
            <h2 className={styles.sectionTitle}>Match <span className="text-gradient">Dashboard</span></h2>
          </div>
          <a href="/matches" style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>See all matches →</a>
        </div>

        <div className={styles.scoreboardGrid}>
          {matches.length > 0 ? matches.map(match => (
            <div key={match.id} className={`${styles.matchCard} glass`}>
              <div className={styles.matchStatus}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                  {match.status === 'LIVE' ? (
                    <span className="badge badge-live">LIVE</span>
                  ) : (
                    <span>{match.status}</span>
                  )}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{match.venue || 'Main Ground'}</span>
              </div>
              
              <div className={styles.matchTeams}>
                <div className={styles.teamRow}>
                  <div className={styles.teamInfo}>
                    <div className={styles.teamLogo}></div>
                    <span style={{ fontWeight: '600' }}>{match.homeTeam.name}</span>
                  </div>
                  <div className={styles.score}>{match.status === 'SCHEDULED' ? '-' : match.homeScore}</div>
                </div>
                <div className={styles.teamRow}>
                  <div className={styles.teamInfo}>
                    <div className={styles.teamLogo}></div>
                    <span style={{ fontWeight: '600' }}>{match.awayTeam.name}</span>
                  </div>
                  <div className={styles.score}>{match.status === 'SCHEDULED' ? '-' : match.awayScore}</div>
                </div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)' }}>No matches scheduled yet.</p>
          )}
        </div>
      </section>

      {/* Standings & News Section */}
      <section className={`${styles.section} glass`} style={{ margin: '0 1.5rem', borderRadius: '32px', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem' }}>
            {/* News Grid */}
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '2.5rem' }}>Exclusive <span className="text-gradient">News</span></h2>
              <div className={styles.newsGrid}>
                {news.length > 0 ? news.map(item => (
                  <div key={item.id} className={`${styles.newsCard} glass`} style={{ borderRadius: '24px' }}>
                    <div className={styles.newsImage}></div>
                    <div className={styles.newsContent}>
                      <span className={styles.newsDate}>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      <h3 className={styles.newsTitle}>{item.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.excerpt}</p>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-muted)' }}>No news updates yet.</p>
                )}
              </div>
            </div>

            {/* Quick Standings */}
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '2.5rem' }}>Standings</h2>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem' }}>TEAM</th>
                      <th style={{ padding: '1rem' }}>P</th>
                      <th style={{ padding: '1rem' }}>GD</th>
                      <th style={{ padding: '1rem' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.9rem' }}>
                    {standings.length > 0 ? standings.map((team, i) => (
                      <tr key={team.id} style={{ borderBottom: i === standings.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{team.name}</td>
                        <td style={{ padding: '1rem' }}>{team.played}</td>
                        <td style={{ padding: '1rem', color: (team.goalsFor - team.goalsAgainst) >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
                          {team.goalsFor - team.goalsAgainst > 0 ? `+${team.goalsFor - team.goalsAgainst}` : team.goalsFor - team.goalsAgainst}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '800' }}>{team.points}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No standings data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button className="btn glass" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.75rem' }}>Full Standings</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
