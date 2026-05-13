import { getServerUser } from "@/lib/server-auth";
import { getAds } from "@/lib/actions/ad.actions";
import { redirect } from "next/navigation";
import AdForm from "./AdForm";
import AdActions from "./AdActions";

export const metadata = {
  title: "Manage Advertisements - Admin",
};

export default async function AdminAdsPage() {
  const user = await getServerUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
    redirect("/");
  }

  const ads = await getAds();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--accent-primary)' }}>
        Manage Advertisements
      </h1>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Advertisement</h2>
        <AdForm />
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Existing Advertisements</h2>
        <div className="responsive-table-container glass" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem' }}>Image</th>
                <th style={{ padding: '1.25rem' }}>Details</th>
                <th style={{ padding: '1.25rem' }}>Position</th>
                <th style={{ padding: '1.25rem' }}>Status</th>
                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length > 0 ? ads.map((ad) => (
                <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ width: '120px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{ad.title}</div>
                    {ad.linkUrl && (
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                        {ad.linkUrl}
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      border: '1px solid var(--border-color)' 
                    }}>
                      {ad.position}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: ad.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: ad.isActive ? '#22c55e' : '#ef4444', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      border: `1px solid ${ad.isActive ? '#22c55e' : '#ef4444'}`
                    }}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <AdActions id={ad.id} isActive={ad.isActive} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No advertisements found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
