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
  if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Component */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        marginLeft: '280px', // Matches sidebar width
        transition: 'margin 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
