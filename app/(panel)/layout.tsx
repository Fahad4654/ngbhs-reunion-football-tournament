import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  // Protect all panel routes
  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Component */}
      <Sidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
        {/* Top Navbar for Panel */}
        <nav className="glass" style={{ 
          height: '72px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 2rem', 
          borderTop: 'none', 
          borderLeft: 'none', 
          borderRight: 'none', 
          borderRadius: 0,
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2 style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Dashboard</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/feed" className="btn glass" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                🌐 Community Feed
              </Link>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
