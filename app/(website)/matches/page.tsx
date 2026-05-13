import prisma from "@/lib/prisma";
import styles from "./matches.module.css";
import Link from "next/link";
import ShieldIcon from '@mui/icons-material/Shield';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdBanner from "@/app/components/AdBanner";
import { getActiveAdsByPosition } from "@/lib/actions/ad.actions";


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
  const [matches, ads] = await Promise.all([
    getMatches(),
    getActiveAdsByPosition('MATCHES')
  ]);

  const hasAds = ads && ads.length > 0;


  const STAGE_ORDER = ["FINAL", "THIRD_PLACE", "SEMI_FINAL", "QUARTER_FINAL", "ROUND_OF_16", "ROUND_OF_32", "GROUP_STAGE"];

  const groupedMatches = STAGE_ORDER.map(stage => ({
    stage,
    matches: matches.filter(m => (m.stage || "GROUP_STAGE") === stage)
  })).filter(group => group.matches.length > 0);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: hasAds ? '1fr 300px' : '1fr', 
        gap: '2.5rem', 
        alignItems: 'start',
        maxWidth: hasAds ? '100%' : '1000px',
        margin: '0 auto'
      }} className="matches-layout">
        
        {/* Main Content */}
        <section className={styles.section} style={{ padding: 0 }}>
          <div style={{ marginBottom: 'clamp(4rem, 10vw, 6rem)', textAlign: 'center' }}>
            <h1 className="text-gradient" style={{ 
              fontSize: 'clamp(3rem, 10vw, 5rem)', 
              marginBottom: '1.5rem',
              lineHeight: 1,
              fontWeight: 950
            }}>
              MATCHES & <br/>RESULTS
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              maxWidth: '700px',
              margin: '0 auto',
              fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
              lineHeight: 1.8,
              fontWeight: 500
            }}>
              Experience the intensity of the NGBHS Reunion Football Championship. From legendary group stage battles to the final whistle of the grand finale.
            </p>
          </div>

          <div className="mobile-only" style={{ marginBottom: '2rem' }}>
            <AdBanner position="MATCHES" />
            <AdBanner position="SIDEBAR" />
          </div>

          {groupedMatches.length > 0 ? groupedMatches.map((group) => (
            <div key={group.stage} className={styles.stageHeader}>
              <div className={styles.stageTitleWrapper}>
                <h2 className={styles.stageTitle}>
                  {group.stage.replace(/_/g, " ")}
                </h2>
              </div>

              <div className={styles.matchList}>
                {group.matches.map((match) => (
                  <Link key={match.id} href={`/matches/${match.id}`} className={`${styles.matchCard} glass`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {/* Home Team */}
                    <div className={`${styles.team} ${styles.teamHome}`}>
                      <span className={styles.teamName}>
                        {match.homeTeam.name}
                        {match.homeCleanSheet && <ShieldIcon sx={{ fontSize: '1rem', color: '#60a5fa', verticalAlign: 'middle', ml: 0.8 }} />}
                      </span>
                      <div className={styles.teamLogo}>
                        {match.homeTeam.logoUrl && (
                          <img src={match.homeTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                      </div>
                    </div>

                    {/* Score / Time */}
                    <div className={styles.scoreContainer}>
                      <div className={styles.scoreBox}>
                        {match.status === 'SCHEDULED' ? (
                          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>VS</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                              <span>{match.homeScore}</span>
                              <span style={{ opacity: 0.2, fontWeight: 300 }}>:</span>
                              <span>{match.awayScore}</span>
                            </div>
                            {(match.homePenaltyScore > 0 || match.awayPenaltyScore > 0) && (
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '0.4rem', letterSpacing: '0' }}>
                                ({match.homePenaltyScore} - {match.awayPenaltyScore} P)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.venue}>
                        <div style={{ marginBottom: '0.4rem', color: 'var(--accent-primary)' }}>
                          {match.status === 'LIVE' ? (
                            <span className="badge badge-live" style={{ padding: '4px 10px' }}>LIVE {match.currentMinute}'</span>
                          ) : match.status}
                        </div>
                        <div style={{ opacity: 0.7 }}>
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ marginTop: '0.2rem', color: 'white', opacity: 0.9 }}>{match.venue || 'Main Stadium'}</div>
                        {match.manOfTheMatch && (
                          <div style={{ color: '#fbbf24', fontWeight: '900', fontSize: '0.7rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <EmojiEventsIcon sx={{ fontSize: '0.9rem' }} /> MOTM: {match.manOfTheMatch.name}
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
                        {match.awayCleanSheet && <ShieldIcon sx={{ fontSize: '1rem', color: '#60a5fa', verticalAlign: 'middle', mr: 0.8 }} />}
                        {match.awayTeam.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )) : (
            <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '30px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>No matches have been scheduled yet.</p>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Check back soon!</p>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)' }} className="desktop-only">
          <AdBanner position="MATCHES" showTitle className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }} />
        </aside>


      </div>
    </div>
  );
}


