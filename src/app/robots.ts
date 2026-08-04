import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dokiments.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/documents",
        "/my-templates",
        "/settings",
      ],
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
