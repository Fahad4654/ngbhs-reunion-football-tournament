import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGBHS Reunion Football Tournament",
  description: "Official platform for tournament updates, news, and live scores for NGBHS Reunion Football.",
  keywords: ["NGBHS", "Reunion", "Football", "Tournament", "Live Scores", "School Reunion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="glass" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 'var(--nav-height)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: 0,
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="container" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'var(--accent-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#000'
              }}>
                NB
              </div>
              <h1 style={{ fontSize: '1.25rem', margin: 0 }}>NGBHS <span className="text-gradient">Tournament</span></h1>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              <a href="/">Home</a>
              <a href="/matches" style={{ color: 'var(--text-secondary)' }}>Matches</a>
              <a href="/standings" style={{ color: 'var(--text-secondary)' }}>Standings</a>
              <a href="/news" style={{ color: 'var(--text-secondary)' }}>News</a>
            </div>

            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Admin Login
            </button>
          </div>
        </nav>
        
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
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>NGBHS Reunion Football</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Bringing batches together through the beautiful game. Every goal, every match, every memory matters.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © 2026 NGBHS Reunion Committee. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
