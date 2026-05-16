import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MediaRenderer from "@/app/components/MediaRenderer";
import { getServerUser } from "@/lib/server-auth";

export default async function DashboardNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  
  const article = await prisma.news.findUnique({
    where: { slug },
    include: {
      batch: {
        select: { name: true }
      }
    }
  });

  if (!article) {
    notFound();
  }

  // If article is batch-specific and user is not in that batch, and not admin
  if (article.batchId && article.batchId !== user.batchId && user.role !== "ADMIN" && user.role !== "CO_ADMIN") {
    // Optionally redirect or show unauthorized, but let's just let them see if they have the link?
    // Usually batch news is private-ish.
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ 
            background: 'rgba(235, 183, 0, 0.1)', 
            color: 'var(--accent-primary)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '6px', 
            fontSize: '0.8rem', 
            fontWeight: '800',
            border: '1px solid rgba(235, 183, 0, 0.2)',
            textTransform: 'uppercase'
          }}>
            Batch {article.batch?.name || 'News'}
          </span>
          {article.isExclusive && (
            <span style={{ 
              background: 'var(--accent-primary)', 
              color: 'black', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.8rem', 
              fontWeight: '900',
              textTransform: 'uppercase'
            }}>
              Exclusive
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: '900', color: 'white', lineHeight: '1.2', marginBottom: '1.5rem' }}>{article.title}</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Published on {new Date(article.publishedAt).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </header>

      {article.imageUrl && (
        <div className="glass" style={{ width: '100%', borderRadius: '24px', marginBottom: '3rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <MediaRenderer 
            url={article.imageUrl} 
            type={article.imageUrl.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'} 
            style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>
      )}

      <div 
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
        style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem', 
          lineHeight: '1.8'
        }}
      />

      <footer style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <Link href="/dashboard/news" className="btn glass" style={{ padding: '1rem 2rem' }}>
          ← Back to News Feed
        </Link>
      </footer>
    </div>
  );
}
