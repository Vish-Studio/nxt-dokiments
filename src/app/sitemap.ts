import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";

// Only public, indexable pages. Signed-in routes (marketplace, subscription, dashboard…) redirect
// crawlers to /sign-in, so listing them would only feed search engines redirects.
const routes: Array<{
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  path: string;
  priority: number;
}> = [
  { changeFrequency: "weekly", path: "/", priority: 1 },
  { changeFrequency: "monthly", path: "/sign-up", priority: 0.8 },
  { changeFrequency: "monthly", path: "/sign-in", priority: 0.5 },
  { changeFrequency: "yearly", path: "/privacy", priority: 0.3 },
  { changeFrequency: "yearly", path: "/terms", priority: 0.3 },
  { changeFrequency: "yearly", path: "/cookies", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
