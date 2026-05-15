import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import MediaRenderer from "@/app/components/MediaRenderer";
import styles from "../news.module.css";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const article = await prisma.news.findUnique({
    where: { slug }
  });

  if (!article) {
    notFound();
  }

  // Access control for batch news
  if (article.batchId) {
    const { getServerUser } = await import("@/lib/server-auth");
    const user = await getServerUser();
    
    const isAdmin = user?.role === "ADMIN" || user?.role === "CO_ADMIN";
    const isBatchMember = user?.batchId === article.batchId;

    if (!isAdmin && !isBatchMember) {
      notFound();
    }
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

        {article.imageUrl && (
          <div className="glass" style={{ width: '100%', borderRadius: '32px', marginBottom: '4rem', overflow: 'hidden' }}>
            <MediaRenderer 
              url={article.imageUrl} 
              type={article.imageUrl.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'} 
              style={{ maxHeight: '600px' }}
            />
          </div>
        )}

        <div 
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem', 
          }}
        />

        <footer style={{ marginTop: '6rem', padding: '3rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <Link href={article.batchId ? "/dashboard/news" : "/news"} className="btn glass">← Back to News Feed</Link>
        </footer>
      </article>
    </div>
  );
}
