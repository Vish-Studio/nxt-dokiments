import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-1752137666154-34d38ba92dd7/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
