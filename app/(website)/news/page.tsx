import prisma from "@/lib/prisma";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MediaRenderer from "@/app/components/MediaRenderer";
import styles from "./news.module.css";
import AdBanner from "@/app/components/AdBanner";
import FloatingAd from "@/app/components/FloatingAd";
import { getActiveAdsByPosition } from "@/lib/actions/ad.actions";


async function getNews() {
  return await prisma.news.findMany({
    where: {
      batchId: null // Only global news
    },
    include: {
      batch: {
        select: { name: true }
      }
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });
}

export default async function NewsPage() {
  const [news, ads] = await Promise.all([
    getNews(),
    getActiveAdsByPosition('NEWS')
  ]);

  const hasAds = ads && ads.length > 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: hasAds ? '1fr 300px' : '1fr', 
        gap: '2.5rem', 
        alignItems: 'start',
        maxWidth: hasAds ? '100%' : '1000px',
        margin: '0 auto'
      }} className="news-layout">
        
        {/* Main Content */}
        <section className={styles.section} style={{ padding: 0 }}>
          <div style={{ marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
            <h1 className="text-gradient" style={{ 
              fontSize: 'clamp(2.25rem, 8vw, 4rem)', 
              marginBottom: '1rem',
              lineHeight: 1.1
            }}>
              LATEST <br/>TOURNAMENT NEWS
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              maxWidth: '600px',
              fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
              lineHeight: 1.6
            }}>
              From match reports to exclusive interviews. Catch up on all the stories happening behind the scenes of the reunion tournament.
            </p>
          </div>

          {/* Mobile Floating Ads (Consolidated) */}
          <FloatingAd positions={['NEWS', 'SIDEBAR', 'FLOATING']} />

          <div className={styles.newsGrid}>
            {news.length > 0 ? news.map((item) => (
              <article key={item.id} className={`${styles.newsCard} glass`}>
                <div className={styles.image}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                    {item.isExclusive && (
                      <div style={{ 
                        background: 'var(--accent-primary)', 
                        color: '#000', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        Exclusive
                      </div>
                    )}
                    {item.batch && (
                      <div style={{ 
                        background: 'rgba(255,255,255,0.9)', 
                        color: '#000', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        Batch {item.batch.name}
                      </div>
                    )}
                  </div>
                  {item.imageUrl && (
                    <MediaRenderer 
                      url={item.imageUrl} 
                      type={item.imageUrl.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'} 
                    />
                  )}
                </div>
                <div className={styles.content}>
                  <span className={styles.date}>
                    {new Date(item.publishedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <h2 className={styles.title}>{item.title}</h2>
                  <p className={styles.excerpt}>{item.excerpt || item.content.substring(0, 150) + '...'}</p>
                  <a href={`/news/${item.slug}`} className={styles.readMore}>
                    Read Full Story →
                  </a>
                </div>
              </article>
            )) : (
              <div className="glass" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                No news articles published yet. Stay tuned!
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)' }} className="desktop-only">
          <AdBanner position="NEWS" showTitle className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }} />
        </aside>



      </div>
    </div>
  );
}

