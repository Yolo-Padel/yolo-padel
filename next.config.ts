import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      /**
       * @description
       *  Staging Url
       */
      {
        protocol: "https",
        hostname: "yh2clvb66mbjivvk.public.blob.vercel-storage.com",
      },
      /**
       * @description
       *  Production Url
       */
      {
        protocol: "https",
        hostname: "5n03s4kvfdmgjrwz.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
