import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wervxh8lalasxqyz.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
