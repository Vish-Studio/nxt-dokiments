import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-1752137666154-34d38ba92dd7/**",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-1516321318423-f06f85e504b3/**",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-1455390582262-044cdead277a/**",
        protocol: "https",
      },
    ],
  },
};

export default withSerwist(nextConfig);
