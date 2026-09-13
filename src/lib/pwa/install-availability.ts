/**
 * Decisions behind the "Install app" button, kept as pure functions so the two
 * rules that decide whether a user ever sees it can be tested outside a browser:
 * which affordance to render, and which manual instructions to give.
 *
 * `install-prompt-store.ts` owns the `beforeinstallprompt` plumbing and
 * `use-install-prompt.ts` reads browser state; both call into this.
 */

/**
 * Which manual route to describe on a browser that has no
 * `beforeinstallprompt` — every one of these installs a web app, but none of
 * them lets the page ask.
 */
export type InstallGuideKey =
  | "ios"
  | "ios-in-app-browser"
  | "safari-desktop"
  | "firefox-android"
  | "browser-menu";

/**
 * Whether this guide's route starts by leaving the current app.
 *
 * The one-time nudge checks this and stays away: an in-app browser cannot install
 * anything, so the honest instructions are "go to Safari first", and spending the
 * single interruption on a three-step detour wastes it. The button still appears
 * and still explains the route for anyone who goes looking.
 */
export const isIndirectInstallGuide = (guide: InstallGuideKey): boolean =>
  guide === "ios-in-app-browser";

/**
 * What the button should render.
 *
 * - `prompt` — a captured `beforeinstallprompt` is in hand; clicking installs.
 * - `guide` — no API here, so clicking explains the browser's own menu path.
 * - `hidden` — already installed, or Chromium has judged the site not
 *   installable and there is nothing truthful to offer.
 */
export type InstallAffordance = "hidden" | "prompt" | "guide";

type InstalledSignals = {
  /** `matchMedia("(display-mode: standalone)").matches`. */
  isStandaloneDisplayMode: boolean;
  /** `navigator.standalone`, the iOS-only equivalent. */
  isIosStandalone: boolean;
};

/**
 * Whether this page is the installed app rather than a browser tab.
 *
 * Only `standalone` is checked, because that is the single `display` value in
 * `app/manifest.ts`; if that manifest ever moves to `minimal-ui` or `fullscreen`
 * this has to widen with it, or the installed app will keep offering to install
 * itself.
 */
export const isRunningAsInstalledApp = ({
  isStandaloneDisplayMode,
  isIosStandalone,
}: InstalledSignals): boolean => isStandaloneDisplayMode || isIosStandalone;

type AffordanceSignals = {
  isInstalled: boolean;
  /** `"onbeforeinstallprompt" in window` — true on Chromium, false elsewhere. */
  supportsInstallPrompt: boolean;
  /** Whether an un-consumed `beforeinstallprompt` event is being held. */
  hasCapturedPrompt: boolean;
  /** Whether a captured event has already been spent on a `prompt()` call. */
  hasUsedPrompt: boolean;
};

/**
 * Picks the affordance from what the browser has actually told us.
 *
 * Support is detected by feature (`onbeforeinstallprompt`) rather than by user
 * agent, and that ordering is the important part. Chromium does not fire the event
 * when the app is already installed, so a UA-driven version would show Chrome
 * users manual instructions for an app already on their home screen. Asking the
 * feature instead means silence on Chromium is read as "nothing to offer" and the
 * button disappears, while Safari and Firefox — which are silent by design — still
 * get the guide.
 *
 * `hasUsedPrompt` covers the user who opened Chromium's dialog and closed it. The
 * spent event cannot be re-prompted and a fresh one only arrives on the next full
 * page load, so rather than have the button vanish mid-session it falls back to
 * the guide — which for Chromium describes the browser menu's own "Install app",
 * still a working route.
 */
export const resolveInstallAffordance = ({
  isInstalled,
  supportsInstallPrompt,
  hasCapturedPrompt,
  hasUsedPrompt,
}: AffordanceSignals): InstallAffordance => {
  if (isInstalled) {
    return "hidden";
  }

  if (!supportsInstallPrompt) {
    return "guide";
  }

  if (hasCapturedPrompt) {
    return "prompt";
  }

  return hasUsedPrompt ? "guide" : "hidden";
};

type BrowserEnvironment = {
  userAgent: string;
  /**
   * `navigator.maxTouchPoints`. iPadOS 13+ reports a desktop Macintosh user agent
   * by default, so this is the only thing separating an iPad from a Mac.
   */
  maxTouchPoints: number;
};

const APPLE_MOBILE_PATTERN = /iPhone|iPod|iPad/;
const MACINTOSH_PATTERN = /Macintosh/;
const FIREFOX_PATTERN = /Firefox\//;
const ANDROID_PATTERN = /Android/;
const SAFARI_PATTERN = /Safari\//;
/** Every Chromium browser also puts `Safari/` in its UA, so it has to be excluded. */
const CHROMIUM_PATTERN = /Chrome\/|Chromium\/|Edg\/|OPR\//;
/**
 * Markers the major social apps leave when a link opens in their own embedded
 * browser rather than in the real one.
 *
 * Only consulted on iOS, where the consequence is concrete: those webviews have no
 * share sheet offering "Add to Home Screen", so the standard iOS instructions are a
 * dead end. A user arriving from an Instagram or LinkedIn link is a common way to
 * land here, not an edge case.
 *
 * Necessarily a list of names rather than a capability check — an iOS webview is
 * WebKit and looks like Safari to every feature test. The list will go stale as
 * apps come and go, and that is an acceptable failure: an unrecognised webview
 * falls back to the plain `ios` guide, which is exactly today's behaviour.
 */
const IOS_IN_APP_BROWSER_PATTERN =
  /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Snapchat|Pinterest|Twitter|musical_ly|Bytedance|Line\//;

/**
 * Chooses the instructions to show, from the user agent alone.
 *
 * UA sniffing is unavoidable here: nothing in this decision is a capability that
 * can be feature-detected — it is a question of where a specific browser hides its
 * install command. It is also a safe place for it, since the only cost of guessing
 * wrong is generic wording (`browser-menu`) instead of the exact menu name.
 *
 * The iPad check has to come before the Safari one: iPadOS claims to be a
 * Macintosh running Safari, and "Add to Home Screen" is the right advice for it
 * while "Add to Dock" is not.
 */
export const detectInstallGuide = ({
  userAgent,
  maxTouchPoints,
}: BrowserEnvironment): InstallGuideKey => {
  const isIpadOsPosingAsMac =
    MACINTOSH_PATTERN.test(userAgent) && maxTouchPoints > 1;

  // Covers every iOS browser, not just Safari: they are all WebKit, none of them
  // fires `beforeinstallprompt`, and since iOS 16.4 they all offer "Add to Home
  // Screen" from the same share sheet — with the exception below, which offers no
  // share sheet at all.
  if (APPLE_MOBILE_PATTERN.test(userAgent) || isIpadOsPosingAsMac) {
    return IOS_IN_APP_BROWSER_PATTERN.test(userAgent)
      ? "ios-in-app-browser"
      : "ios";
  }

  if (FIREFOX_PATTERN.test(userAgent)) {
    // Desktop Firefox cannot install a web app at all, so it falls through to the
    // generic wording rather than being promised an "Install" item it lacks.
    return ANDROID_PATTERN.test(userAgent) ? "firefox-android" : "browser-menu";
  }

  if (
    MACINTOSH_PATTERN.test(userAgent) &&
    SAFARI_PATTERN.test(userAgent) &&
    !CHROMIUM_PATTERN.test(userAgent)
  ) {
    return "safari-desktop";
  }

  return "browser-menu";
};
