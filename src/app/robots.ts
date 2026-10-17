import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";

// Signed-in app routes redirect to /sign-in for crawlers (see src/proxy.ts) and carry noindex
// metadata, so crawling them only wastes budget. Keep this list in sync with PROTECTED_PREFIXES.
const privatePaths = [
  "/api/",
  "/dashboard",
  "/my-documents",
  "/my-templates",
  "/my-clients",
  "/marketplace",
  "/settings",
  "/subscription",
  "/forgot-password",
  "/offline",
  "/share-target",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privatePaths,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
