import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--accent-primary)', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#000',
            fontWeight: '800'
          }}>
            {session.user?.name?.charAt(0)}
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem' }}>User Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name</label>
            <div style={{ fontWeight: '600' }}>{session.user?.name}</div>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</label>
            <div style={{ fontWeight: '600' }}>{session.user?.email}</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Account Role</label>
            <div style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>{session.user?.role}</div>
          </div>
        </div>

        <button className="btn glass" style={{ width: '100%', marginTop: '3rem', border: '1px solid var(--border-color)' }}>
          Update Profile Settings
        </button>
      </div>
    </div>
  );
}
