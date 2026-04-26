import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "../news.module.css";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const article = await prisma.news.findUnique({
    where: { slug }
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="container">
      <article style={{ padding: '6rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            {article.isExclusive ? 'Exclusive Story' : 'Tournament News'}
          </span>
          <h1 style={{ fontSize: '3.5rem', marginTop: '1rem', marginBottom: '1rem' }}>{article.title}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Published on {new Date(article.publishedAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </header>

        <div className="glass" style={{ width: '100%', height: '400px', borderRadius: '32px', marginBottom: '4rem' }}></div>

        <div style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem', 
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap'
        }}>
          {article.content}
        </div>

        <footer style={{ marginTop: '6rem', padding: '3rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <a href="/news" className="btn glass">← Back to News Feed</a>
        </footer>
      </article>
    </div>
  );
}
