import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dokiments.com";

const routes = [
  { path: "/", priority: 1 },
  { path: "/sign-in", priority: 0.9 },
  { path: "/sign-up", priority: 0.85 },
  { path: "/marketplace", priority: 0.8 },
  { path: "/subscription", priority: 0.7 },
  { path: "/privacy", priority: 0.35 },
  { path: "/cookies", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: new URL(route.path, baseUrl).toString(),
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}
