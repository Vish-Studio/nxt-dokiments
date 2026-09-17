import { describe, expect, it } from "vitest";

import {
  shouldCheckForUpdate,
  shouldReloadForUpdate,
  UPDATE_CHECK_INTERVAL_MS,
} from "./update-policy";

describe("shouldReloadForUpdate", () => {
  it("reloads once the user has accepted", () => {
    expect(
      shouldReloadForUpdate({ hasAccepted: true, hasReloaded: false }),
    ).toBe(true);
  });

  it("does not reload when the worker took control on its own", () => {
    // The first install of a first visit also fires `controlling`. Reloading here
    // would reload the page under every new visitor.
    expect(
      shouldReloadForUpdate({ hasAccepted: false, hasReloaded: false }),
    ).toBe(false);
  });

  it("does not reload twice, even after an accepted update", () => {
    expect(
      shouldReloadForUpdate({ hasAccepted: true, hasReloaded: true }),
    ).toBe(false);
  });
});

describe("shouldCheckForUpdate", () => {
  it("always checks the first time", () => {
    expect(shouldCheckForUpdate({ now: 0, lastCheckedAt: null })).toBe(true);
  });

  it("checks again exactly on the interval boundary", () => {
    expect(
      shouldCheckForUpdate({
        now: UPDATE_CHECK_INTERVAL_MS,
        lastCheckedAt: 0,
      }),
    ).toBe(true);
  });

  it("declines one millisecond short of the boundary", () => {
    expect(
      shouldCheckForUpdate({
        now: UPDATE_CHECK_INTERVAL_MS - 1,
        lastCheckedAt: 0,
      }),
    ).toBe(false);
  });

  it("declines a burst of resumes in quick succession", () => {
    expect(shouldCheckForUpdate({ now: 1_000, lastCheckedAt: 900 })).toBe(
      false,
    );
  });

  it("honours an overridden interval, so stories and tests need not wait", () => {
    expect(
      shouldCheckForUpdate({ now: 50, lastCheckedAt: 0, intervalMs: 10 }),
    ).toBe(true);
  });
});
