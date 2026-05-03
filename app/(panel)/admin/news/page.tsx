import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteNewsAction from "./DeleteNewsAction";

export default async function AdminNewsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const news = await prisma.news.findMany({
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <Link href="/admin/news/new" className="btn btn-primary">+ Create New Article</Link>
      </div>

      <div className="responsive-table-container glass" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem' }}>Published</th>
              <th style={{ padding: '1.25rem' }}>Title & Excerpt</th>
              <th style={{ padding: '1.25rem' }}>Author</th>
              <th style={{ padding: '1.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '600' }}>{new Date(item.publishedAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.publishedAt).toLocaleTimeString()}</div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.excerpt}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Admin</span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/news/${item.id}/edit`} className="btn glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Edit</Link>
                    <DeleteNewsAction newsId={item.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
