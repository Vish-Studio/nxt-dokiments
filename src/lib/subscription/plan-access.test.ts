import { describe, expect, it } from "vitest";

import { canUpgrade, getPlanFeatures } from "./plan-access";

const labels = (role: Parameters<typeof getPlanFeatures>[0]) =>
  Object.fromEntries(
    getPlanFeatures(role).map((feature) => [feature.label, feature.included]),
  );

describe("getPlanFeatures", () => {
  it("gives free accounts Classic templates and a capped library", () => {
    const free = labels("free");

    expect(free["Classic templates"]).toBe(true);
    expect(free["Modern templates"]).toBe(false);
    expect(free["Minimalist templates"]).toBe(false);
    expect(free["Save up to 2 templates"]).toBe(true);
  });

  it("unlocks Modern on Silver but not the Gold styles", () => {
    const silver = labels("silver");

    expect(silver["Modern templates"]).toBe(true);
    expect(silver["Brutalist templates"]).toBe(false);
    expect(silver["Unlimited saved templates"]).toBe(true);
  });

  it("names the plan that unlocks a locked style", () => {
    const modern = getPlanFeatures("free").find(
      (feature) => feature.label === "Modern templates",
    );

    expect(modern?.note).toBe("Silver plan");
  });

  it("unlocks everything for a superadmin", () => {
    expect(
      getPlanFeatures("superadmin").every((feature) => feature.included),
    ).toBe(true);
    expect(canUpgrade("superadmin")).toBe(false);
  });

  it("offers an upgrade to a free account", () => {
    expect(canUpgrade("free")).toBe(true);
  });
});
