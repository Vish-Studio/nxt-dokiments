import { describe, expect, it } from "vitest";

import { isInstallNudgeEligible } from "./install-nudge-policy";

const eligible = {
  affordance: "prompt",
  guide: "browser-menu",
  isAuthenticated: true,
  isCookieConsentSettled: true,
  isUpdateReady: false,
} as const;

describe("isInstallNudgeEligible", () => {
  it("allows the nudge for a signed-in user with an install on offer", () => {
    expect(isInstallNudgeEligible(eligible)).toBe(true);
  });

  it("allows it on a browser that can only be shown instructions", () => {
    // iOS is the reason the nudge exists at all, and it never gets a native
    // prompt — so `guide` has to count as an install worth offering.
    expect(
      isInstallNudgeEligible({
        ...eligible,
        affordance: "guide",
        guide: "ios",
      }),
    ).toBe(true);
  });

  it("stays away inside a social app's in-app browser", () => {
    // Installing from here means going out to Safari first. The nudge gets one
    // appearance ever and should not spend it on a three-step detour — the button
    // still explains the route for anyone who goes looking.
    expect(
      isInstallNudgeEligible({
        ...eligible,
        affordance: "guide",
        guide: "ios-in-app-browser",
      }),
    ).toBe(false);
  });

  it("stays away when there is no install to offer", () => {
    // Also the state immediately after a successful install, which is what makes
    // the banner leave on its own.
    expect(isInstallNudgeEligible({ ...eligible, affordance: "hidden" })).toBe(
      false,
    );
  });

  it("does not interrupt a visitor who has not signed in", () => {
    // They have not used the product yet, and the footer button is already easy
    // to find. The one interruption is saved for the dashboard.
    expect(
      isInstallNudgeEligible({ ...eligible, isAuthenticated: false }),
    ).toBe(false);
  });

  it("queues behind the cookie banner", () => {
    expect(
      isInstallNudgeEligible({ ...eligible, isCookieConsentSettled: false }),
    ).toBe(false);
  });

  it("yields to the app-update banner", () => {
    // Same strip of screen, and a stale build is time-sensitive where an install
    // is not.
    expect(isInstallNudgeEligible({ ...eligible, isUpdateReady: true })).toBe(
      false,
    );
  });
});
