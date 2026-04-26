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
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <div className="glass" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
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
          <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge" style={{ marginBottom: '0.5rem' }}>Account Settings</div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Your Profile</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className={`badge ${user.status === 'APPROVED' ? 'badge-success' : user.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                Status: {user.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Update your alumni identity and contact details.</p>
            {user.status === 'PENDING' && (
              <p style={{ color: 'var(--accent-warning)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '600' }}>
                Your account is currently waiting for approval from your Batch Manager.
              </p>
            )}
          </header>

          <ProfileForm key={user.uid + (user.batchId || '') + (user.name || '')} user={user} batches={batches} />
        </div>
      </div>
    </div>
  );
}
