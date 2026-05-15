import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MediaRenderer from "@/app/components/MediaRenderer";
import Link from "next/link";

export default async function DashboardNewsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Admins and Managers should use the News Manager link, 
  // but we can still show them this view if they land here.
  if (user.role === "ADMIN" || user.role === "CO_ADMIN" || user.role === "BATCH_MANAGER") {
    // Optionally redirect, but let's keep it for users
  }

  if (!user.batchId) {
    return (
      <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '12px' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>No Batch Selected</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please update your profile to select a batch and see batch news.</p>
        <Link href="/profile" className="btn btn-primary" style={{ marginTop: '2rem' }}>Update Profile</Link>
      </div>
    );
  }

  const news = await prisma.news.findMany({
    where: {
      batchId: user.batchId
    },
    include: {
      author: {
        select: { name: true }
      },
      batch: {
        select: { name: true }
      }
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="glass" style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(235, 183, 0, 0.1)',
          border: '1px solid rgba(235, 183, 0, 0.3)'
        }}>
          <NewspaperIcon sx={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem', color: 'white', textTransform: 'uppercase' }}>Batch News</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Updates specifically for Batch {news[0]?.batch?.name || ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {news.length > 0 ? news.map((item) => (
          <article key={item.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {item.imageUrl && (
              <div style={{ width: '100%', height: '250px', position: 'relative', overflow: 'hidden' }}>
                <MediaRenderer 
                  url={item.imageUrl} 
                  type={item.imageUrl.match(/\.(mp4|webm|mov)$/i) ? 'VIDEO' : 'IMAGE'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {item.isExclusive && (
                  <span style={{ background: 'var(--accent-primary)', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                    Exclusive
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '1rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>{item.excerpt || item.content.substring(0, 200) + '...'}</p>
              <Link href={`/news/${item.slug}`} className="btn glass" style={{ width: '100%', justifyContent: 'center' }}>
                Read Full Story
              </Link>
            </div>
          </article>
        )) : (
          <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '12px' }}>
            <NewspaperIcon sx={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No news updates for your batch yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
