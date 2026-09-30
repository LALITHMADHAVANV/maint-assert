import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.31.176',
    '192.168.31.*',
    'localhost',
  ],
};

export default nextConfig;
