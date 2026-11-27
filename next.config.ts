import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

import packageJson from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.*"],
  env: {
    // Inlined into the client bundle at build time so the signed-in sidebar can
    // display the running app version without shipping the whole package.json.
    APP_VERSION: packageJson.version,
  },
  // Vercel's own *.vercel.app address serves the same site. Keep it out of
  // search results so it never competes with www.dokiments.com (its pages
  // already point their canonical there).
  async headers() {
    return [
      {
        has: [{ type: "host", value: "(?<host>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        source: "/:path*",
      },
    ];
  },
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
