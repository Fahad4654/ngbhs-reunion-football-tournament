import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGBHS Reunion Football Championship",
  description: "Official platform for Natore Government Boys' High School Reunion Football Championship updates, news, and live scores.",
  keywords: ["Natore Government Boys High School", "Reunion", "Football", "Championship", "Tournament"],
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100vw' }}>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
