import type { Metadata } from "next";
import "./globals.css";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "Natore Government Boys' High School Reunion Football Championship",
  description: "Official platform for Natore Government Boys' High School Reunion Football Championship updates, news, and live scores.",
  keywords: ["Natore Government Boys High School", "Reunion", "Football", "Championship", "Tournament"],
};

import Navbar from "./components/Navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Navbar session={session} />
        
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © 2026 NGBHS Reunion Committee. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
