import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['fahad-hp-probook-440','192.168.0.129'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
};
export default nextConfig;
