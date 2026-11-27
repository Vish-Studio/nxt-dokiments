import { describe, expect, it } from "vitest";

import { privatePaths } from "./robots";
import sitemap, { sitemapRoutes } from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every route once, on the canonical host", () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls)
      expect(url).toMatch(/^https?:\/\/[^/]+(\/[a-z-]+)?$/);
  });

  it("never lists a path robots.txt disallows", () => {
    for (const { path } of sitemapRoutes) {
      for (const blocked of privatePaths) {
        expect(path.startsWith(blocked)).toBe(false);
      }
    }
  });

  it("uses fixed content dates, not the request time", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("gives the home page an absolute image", () => {
    expect(entries[0].images?.[0]).toMatch(/^https?:\/\/.+\.png$/);
  });
});
