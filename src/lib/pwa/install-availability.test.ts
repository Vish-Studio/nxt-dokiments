import { describe, expect, it } from "vitest";

import {
  detectInstallGuide,
  isIndirectInstallGuide,
  isRunningAsInstalledApp,
  resolveInstallAffordance,
} from "./install-availability";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD_SAFARI_DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const MAC_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const ANDROID_FIREFOX =
  "Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0";
const WINDOWS_FIREFOX =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const IPHONE_INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 331.0.0.37.90 (iPhone15,2; iOS 17_5; en_US)";
const IPHONE_FACEBOOK =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/466.0.0.35.107;FBBV/599637306]";
const IPHONE_LINKEDIN =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LinkedInApp";
const ANDROID_INSTAGRAM =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 331.0.0.37.90 Android";

describe("isRunningAsInstalledApp", () => {
  it("recognises the installed app from the display mode", () => {
    expect(
      isRunningAsInstalledApp({
        isStandaloneDisplayMode: true,
        isIosStandalone: false,
      }),
    ).toBe(true);
  });

  it("recognises an iOS home-screen app from the legacy WebKit flag", () => {
    expect(
      isRunningAsInstalledApp({
        isStandaloneDisplayMode: false,
        isIosStandalone: true,
      }),
    ).toBe(true);
  });

  it("treats a plain browser tab as not installed", () => {
    expect(
      isRunningAsInstalledApp({
        isStandaloneDisplayMode: false,
        isIosStandalone: false,
      }),
    ).toBe(false);
  });
});

describe("resolveInstallAffordance", () => {
  const notInstalledChromium = {
    isInstalled: false,
    supportsInstallPrompt: true,
    hasCapturedPrompt: false,
    hasUsedPrompt: false,
  };

  it("offers the native prompt once an event has been captured", () => {
    expect(
      resolveInstallAffordance({
        ...notInstalledChromium,
        hasCapturedPrompt: true,
      }),
    ).toBe("prompt");
  });

  it("hides itself inside the installed app", () => {
    // The installed app must never offer to install itself, on any browser —
    // this outranks every other signal, including a stale captured event.
    expect(
      resolveInstallAffordance({
        ...notInstalledChromium,
        isInstalled: true,
        hasCapturedPrompt: true,
      }),
    ).toBe("hidden");
  });

  it("guides the user on a browser with no install API", () => {
    expect(
      resolveInstallAffordance({
        ...notInstalledChromium,
        supportsInstallPrompt: false,
      }),
    ).toBe("guide");
  });

  it("stays hidden when Chromium has not judged the site installable", () => {
    // Chromium is also silent when the app is already installed but being viewed
    // in a tab, where `display-mode` reads `browser`. Showing instructions here
    // would tell a user to install what they already have.
    expect(resolveInstallAffordance(notInstalledChromium)).toBe("hidden");
  });

  it("falls back to the guide after the user closed Chromium's dialog", () => {
    // The spent event cannot be prompted twice and a fresh one only arrives on the
    // next full page load, so the guide keeps a working route open rather than
    // letting the button disappear mid-session.
    expect(
      resolveInstallAffordance({
        ...notInstalledChromium,
        hasUsedPrompt: true,
      }),
    ).toBe("guide");
  });
});

describe("isIndirectInstallGuide", () => {
  it("flags the in-app browser route, which starts in another app", () => {
    expect(isIndirectInstallGuide("ios-in-app-browser")).toBe(true);
  });

  it("does not flag routes the user can finish where they are", () => {
    // Every other guide is a couple of taps in the browser they already have open,
    // which is cheap enough for the one-time nudge to interrupt for.
    for (const guide of [
      "ios",
      "safari-desktop",
      "firefox-android",
      "browser-menu",
    ] as const) {
      expect(isIndirectInstallGuide(guide)).toBe(false);
    }
  });
});

describe("detectInstallGuide", () => {
  it("sends iPhone users to the share sheet", () => {
    expect(
      detectInstallGuide({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }),
    ).toBe("ios");
  });

  it("recognises an iPad behind its desktop user agent", () => {
    // iPadOS 13+ claims to be a Macintosh running Safari; only the touch points
    // give it away, and "Add to Dock" would be the wrong advice.
    expect(
      detectInstallGuide({
        userAgent: IPAD_SAFARI_DESKTOP_UA,
        maxTouchPoints: 5,
      }),
    ).toBe("ios");
  });

  it("sends desktop Safari to the Dock", () => {
    expect(
      detectInstallGuide({ userAgent: MAC_SAFARI, maxTouchPoints: 0 }),
    ).toBe("safari-desktop");
  });

  it("does not mistake Chrome on macOS for Safari", () => {
    // Every Chromium UA also carries `Safari/`.
    expect(
      detectInstallGuide({ userAgent: MAC_CHROME, maxTouchPoints: 0 }),
    ).toBe("browser-menu");
  });

  it("names the Install item for Firefox on Android", () => {
    expect(
      detectInstallGuide({ userAgent: ANDROID_FIREFOX, maxTouchPoints: 5 }),
    ).toBe("firefox-android");
  });

  it("stays generic on desktop Firefox, which cannot install web apps", () => {
    expect(
      detectInstallGuide({ userAgent: WINDOWS_FIREFOX, maxTouchPoints: 0 }),
    ).toBe("browser-menu");
  });

  it.each([
    ["Instagram", IPHONE_INSTAGRAM],
    ["Facebook", IPHONE_FACEBOOK],
    ["LinkedIn", IPHONE_LINKEDIN],
  ])(
    "routes the iOS %s in-app browser out to Safari first",
    (_app, userAgent) => {
      // These webviews have no share sheet, so the plain `ios` instructions would
      // send the user hunting for a Share button that does not exist.
      expect(detectInstallGuide({ userAgent, maxTouchPoints: 5 })).toBe(
        "ios-in-app-browser",
      );
    },
  );

  it("leaves real iOS browsers on the direct path", () => {
    expect(
      detectInstallGuide({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }),
    ).toBe("ios");
  });

  it("does not apply the iOS webview wording to Android", () => {
    // Android in-app webviews are a separate problem with a different answer, and
    // the generic menu wording is not actively wrong there.
    expect(
      detectInstallGuide({ userAgent: ANDROID_INSTAGRAM, maxTouchPoints: 5 }),
    ).toBe("browser-menu");
  });

  it("falls back to generic wording for anything unrecognised", () => {
    expect(
      detectInstallGuide({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }),
    ).toBe("browser-menu");
    expect(detectInstallGuide({ userAgent: "", maxTouchPoints: 0 })).toBe(
      "browser-menu",
    );
  });
});
