import prisma from "@/lib/prisma";
import styles from "./news.module.css";

async function getNews() {
  return await prisma.news.findMany({
    orderBy: {
      publishedAt: 'desc',
    },
  });
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="container">
      <section className={styles.section}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Latest <br/>Tournament News</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
            From match reports to exclusive interviews. Catch up on all the stories happening behind the scenes of the reunion tournament.
          </p>
        </div>

        <div className={styles.newsGrid}>
          {news.length > 0 ? news.map((item) => (
            <article key={item.id} className={`${styles.newsCard} glass`}>
              <div className={styles.image}>
                {item.isExclusive && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    left: '1rem', 
                    background: 'var(--accent-primary)', 
                    color: '#000', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    Exclusive
                  </div>
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
    </div>
  );
}
