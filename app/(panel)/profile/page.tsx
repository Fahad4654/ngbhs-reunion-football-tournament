import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { getAllBatches } from "@/lib/actions";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await getServerUser();
  const batches = await getAllBatches();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(0.5rem, 2vw, 1rem)' }}>
      <div className="glass panel-card" style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: 'clamp(1.25rem, 5vw, 2.5rem)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Background Accents */}
        <div style={{ 
          position: 'absolute', 
          top: '-50px', 
          right: '-50px', 
          width: '200px', 
          height: '200px', 
          background: 'radial-gradient(circle, rgba(235, 183, 0, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <header style={{ marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
            <div className="badge" style={{ marginBottom: '0.5rem', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)' }}>Account Settings</div>
            <h1 className="text-gradient" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', lineHeight: 1.2 }}>User Profile</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className={`badge ${user.status === 'APPROVED' ? 'badge-success' : user.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)' }}>
                Status: {user.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>Manage your alumni identity and contact details.</p>
            {user.status === 'PENDING' && (
              <p style={{ color: 'var(--accent-warning)', fontSize: 'clamp(0.8rem, 2.8vw, 0.9rem)', marginTop: '0.5rem', fontWeight: '600' }}>
                Your account is currently waiting for approval from your Batch Manager.
              </p>
            )}
          </header>

          <ProfileForm key={user.uid + (user.batchId || '') + (user.name || '') + JSON.stringify(user.privacySettings)} user={user} batches={batches} />
        </div>
      </div>
    </div>
  );
}
