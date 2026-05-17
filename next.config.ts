import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['fahad-hp-probook-440', '192.168.0.129', 'https://ngbhs-reunion-football-tournament.vercel.app', 'https://ngbhs-reunion-football-tournament-git-main-fahad065-projects.vercel.app', 'https://ngbhs-reunion-football-tournament-4j41g637m-fahad065-projects.vercel.app'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};
export default nextConfig;
