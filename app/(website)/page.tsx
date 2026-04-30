import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";

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

import HeroSlideshow from "../components/HeroSlideshow";

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
        <HeroSlideshow />
        
        <div className={`${styles.heroContent} container`}>
          <div className="badge">Official Reunion Championship</div>
          <h1 className={`${styles.heroTitle} text-gradient`}>
            NGBHS REUNION <br/>FOOTBALL CHAMPIONSHIP
          </h1>
          <p style={{ 
            color: 'var(--accent-primary)', 
            fontSize: 'calc(0.917vw * var(--font-scale))', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            marginBottom: '1.852vh'
          }}>
            Natore Government Boys&apos; High School
          </p>
          <p className={styles.heroSubtitle}>
            Experience the thrill of the reunion. Tracking live scores, exclusive news, and every memorable goal from all school batches.
          </p>
          <div style={{ display: 'flex', gap: '0.833vw' }}>
            <Link href="/matches" className="btn btn-primary">View Fixtures</Link>
            <Link href="/standings" className="btn glass">Batch Standings</Link>
          </div>
        </div>
      </section>

      {/* Live Scoreboard Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderTitle}>
              <div className={styles.sectionSubtitle}>Current Action</div>
              <h2 className={styles.sectionTitle}>Match <span className="text-gradient">Dashboard</span></h2>
            </div>
            <Link href="/matches" className={styles.sectionLink}>See all matches →</Link>
          </div>

          <div className={styles.scoreboardGrid}>
            {matches.length > 0 ? matches.map(match => (
              <div key={match.id} className={`${styles.matchCard} glass`}>
                <div className={styles.matchStatus}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'calc(0.667vw * var(--font-scale))', fontWeight: '600' }}>
                    {match.status === 'LIVE' ? (
                      <span className="badge badge-live">LIVE</span>
                    ) : (
                      <span>{match.status}</span>
                    )}
                  </span>
                  <span style={{ fontSize: 'calc(0.667vw * var(--font-scale))', color: 'var(--text-muted)' }}>{match.venue || 'Main Ground'}</span>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.917vw' }}>No matches scheduled yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Exclusive News Section */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ marginBottom: '2.963vh' }}>Exclusive <span className="text-gradient">News</span></h2>
          <div className={styles.newsGrid}>
            {news.length > 0 ? news.map(item => (
              <div key={item.id} className={`${styles.newsCard} glass`} style={{ borderRadius: '1.25vw' }}>
                <div className={styles.newsImage}></div>
                <div className={styles.newsContent}>
                  <span className={styles.newsDate}>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'calc(0.75vw * var(--font-scale))', lineHeight: '1.6' }}>{item.excerpt}</p>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.917vw' }}>No news updates yet.</p>
            )}
          </div>
          <div style={{ marginTop: '2.963vh', textAlign: 'center' }}>
            <Link href="/news" className="btn glass">View All News</Link>
          </div>
        </div>
      </section>

      {/* Standings Section */}
      <section className="glass" style={{ margin: '1.852vh 1.042vw', borderRadius: '2.083vw', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container" style={{ padding: '4.444vh 1.042vw' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '2.963vh', textAlign: 'center' }}>Tournament <span className="text-gradient">Standings</span></h2>
          <div className="glass" style={{ padding: '1.481vh 1.042vw', borderRadius: '1.563vw', overflow: 'hidden' }}>
            <div className={styles.tableWrapper}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', fontSize: '0.729vw', textAlign: 'left', borderBottom: '0.052vw solid var(--border-color)' }}>
                    <th style={{ padding: '1.481vh 1.042vw' }}>BATCH / TEAM</th>
                    <th style={{ padding: '1.481vh 1.042vw', textAlign: 'center' }}>PLAYED</th>
                    <th style={{ padding: '1.481vh 1.042vw', textAlign: 'center' }}>WINS</th>
                    <th style={{ padding: '1.481vh 1.042vw', textAlign: 'center' }}>GD</th>
                    <th style={{ padding: '1.481vh 1.042vw', textAlign: 'center' }}>POINTS</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.833vw' }}>
                  {standings.length > 0 ? standings.map((team, i) => (
                    <tr key={team.id} style={{ borderBottom: i === standings.length - 1 ? 'none' : '0.052vw solid var(--border-color)' }}>
                      <td style={{ padding: '1.481vh 1.042vw', fontWeight: '800', color: 'white', fontSize: 'calc(0.833vw * var(--font-scale))' }}>{team.name}</td>
                      <td style={{ padding: '1.481vh 1.042vw', textAlign: 'center', fontSize: 'calc(0.833vw * var(--font-scale))' }}>{team.played}</td>
                      <td style={{ padding: '1.481vh 1.042vw', textAlign: 'center', fontSize: 'calc(0.833vw * var(--font-scale))' }}>{team.won}</td>
                      <td style={{ padding: '1.481vh 1.042vw', textAlign: 'center', fontWeight: '700', color: (team.goalsFor - team.goalsAgainst) >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: 'calc(0.833vw * var(--font-scale))' }}>
                        {team.goalsFor - team.goalsAgainst > 0 ? `+${team.goalsFor - team.goalsAgainst}` : team.goalsFor - team.goalsAgainst}
                      </td>
                      <td style={{ padding: '1.481vh 1.042vw', textAlign: 'center', fontWeight: '900', fontSize: 'calc(1.042vw * var(--font-scale))', color: 'var(--accent-primary)' }}>{team.points}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.963vh', textAlign: 'center', color: 'var(--text-muted)' }}>No standings data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Link href="/standings" className="btn glass" style={{ width: '100%', marginTop: '1.852vh', fontWeight: '700', justifyContent: 'center' }}>VIEW COMPLETE LEAGUE TABLE</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
