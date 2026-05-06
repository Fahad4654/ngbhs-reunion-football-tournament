import Navbar from "../components/Navbar";
import { getServerUser } from "@/lib/server-auth";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <>
      <Navbar user={user} />
      
      <main style={{ marginTop: 'var(--nav-height)' }}>
        {children}
      </main>

      <footer className="glass" style={{
        marginTop: '4rem',
        padding: '4rem 0',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Natore Government Boys&apos; High School</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: '600' }}>
            Reunion Football Championship
          </p>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Bringing batches together through the beautiful game. Every goal, every match, every memory matters.
          </p>
        </div>
      </footer>
    </>
  );
}
