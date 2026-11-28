import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const adminRoot = path.join(process.cwd(), "src/app/admin");
const adminApiRoot = path.join(process.cwd(), "src/app/api/admin");

/** Every file called `name` under `dir`, recursively. */
const findFiles = (dir: string, name: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return findFiles(full, name);
    return entry === name ? [full] : [];
  });

// The portal's whole safety rests on every page and route checking the role
// itself. A new page that forgets is the most likely way to leak it, so this
// fails the build instead of relying on review.
describe("admin access guards", () => {
  it("checks the superadmin role in every admin page", () => {
    const pages = findFiles(adminRoot, "page.tsx");

    expect(pages.length).toBeGreaterThanOrEqual(15);
    for (const page of pages) {
      expect(readFileSync(page, "utf8"), path.relative(process.cwd(), page)).toContain("await requireSuperadmin()");
    }
  });

  it("wraps every admin API route in withSuperadmin", () => {
    const routes = findFiles(adminApiRoot, "route.ts");

    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      const source = readFileSync(route, "utf8");
      expect(source, path.relative(process.cwd(), route)).toContain("withSuperadmin");
      expect(source, path.relative(process.cwd(), route)).not.toMatch(/=\s*withSession\(/);
    }
  });
});
