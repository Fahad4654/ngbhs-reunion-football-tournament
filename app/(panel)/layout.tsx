import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import PanelNavbar from "@/app/components/panel/PanelNavbar";

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px', position: 'relative' }}>
        <div style={{ height: '72px' }}> {/* Navbar placeholder to prevent layout shift */}
          <PanelNavbar userName={user.name} />
        </div>

        <main style={{ padding: '3.5rem 2rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
