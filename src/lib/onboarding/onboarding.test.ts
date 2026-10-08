import { describe, expect, it } from "vitest";

import {
  hasOnboardingFlag,
  withOnboarding,
  withoutOnboarding,
} from "./onboarding";

describe("withOnboarding", () => {
  it("adds the flag to a plain path", () => {
    expect(withOnboarding("/dashboard")).toBe("/dashboard?welcome=1");
  });

  it("keeps an existing query string and hash", () => {
    expect(withOnboarding("/dashboard?promo=applied#top")).toBe(
      "/dashboard?promo=applied&welcome=1#top",
    );
  });

  it("stays relative, so it cannot become an off-site redirect", () => {
    expect(withOnboarding("https://evil.example/phish")).toBe(
      "/phish?welcome=1",
    );
  });
});

describe("hasOnboardingFlag", () => {
  it("is true only for the exact flag", () => {
    expect(hasOnboardingFlag("?welcome=1")).toBe(true);
    expect(hasOnboardingFlag("?promo=applied&welcome=1")).toBe(true);
    expect(hasOnboardingFlag("?welcome=0")).toBe(false);
    expect(hasOnboardingFlag("")).toBe(false);
  });
});

describe("withoutOnboarding", () => {
  it("removes the flag and keeps everything else", () => {
    expect(
      withoutOnboarding("http://localhost:3000/dashboard?welcome=1&promo=applied"),
    ).toBe("/dashboard?promo=applied");
  });

  it("leaves a URL without the flag untouched", () => {
    expect(withoutOnboarding("http://localhost:3000/dashboard")).toBe(
      "/dashboard",
    );
  });
});
