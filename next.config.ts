import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yh2clvb66mbjivvk.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
