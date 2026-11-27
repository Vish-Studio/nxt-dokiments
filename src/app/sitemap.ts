import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";
import { mauritiusPage } from "@/lib/website/local-pages";

/** One public page in the sitemap. */
type SitemapRoute = {
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  /**
   * Date (YYYY-MM-DD) the page's content last really changed. Bump it when
   * you change the page. Google ignores `lastmod` that moves on every
   * request, so never use the build or request time here.
   */
  lastModified: string;
  path: string;
  priority: number;
  /** Absolute image URLs shown on the page, for Google Images. */
  images?: string[];
};

/** The social preview image Next serves from `src/app/opengraph-image.png`. */
const ogImage = `${siteUrl}/opengraph-image.png`;

/**
 * Only public, indexable pages. Signed-in routes (marketplace, subscription,
 * dashboard…) redirect crawlers to /sign-in and are disallowed in robots.ts,
 * so listing them would only feed search engines redirects.
 */
export const sitemapRoutes: SitemapRoute[] = [
  {
    changeFrequency: "weekly",
    images: [ogImage],
    lastModified: "2026-11-27",
    path: "/",
    priority: 1,
  },
  // Local landing pages (src/lib/website/local-pages.ts).
  {
    changeFrequency: "monthly",
    images: [ogImage],
    lastModified: "2026-11-27",
    path: `/${mauritiusPage.slug}`,
    priority: 0.9,
  },
  {
    changeFrequency: "monthly",
    lastModified: "2026-11-27",
    path: "/sign-up",
    priority: 0.8,
  },
  {
    changeFrequency: "monthly",
    lastModified: "2026-11-27",
    path: "/sign-in",
    priority: 0.5,
  },
  {
    changeFrequency: "yearly",
    lastModified: "2026-11-27",
    path: "/privacy",
    priority: 0.3,
  },
  {
    changeFrequency: "yearly",
    lastModified: "2026-11-27",
    path: "/terms",
    priority: 0.3,
  },
  {
    changeFrequency: "yearly",
    lastModified: "2026-11-27",
    path: "/cookies",
    priority: 0.2,
  },
];

/**
 * `GET /sitemap.xml`: every public page on the canonical host, with the date
 * its content last changed and its images. Submitted in Google Search Console
 * and referenced from robots.txt. See docs/seo.md.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => ({
    url: `${siteUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.images ? { images: route.images } : {}),
  }));
}
