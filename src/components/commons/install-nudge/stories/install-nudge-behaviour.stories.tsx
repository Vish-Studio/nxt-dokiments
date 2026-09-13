import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";
import { INSTALL_NUDGE_STORAGE_KEY } from "@/lib/pwa/install-nudge-policy";
import { useAuthStore } from "@/stores/auth-store";
import { useInstallPromptStore } from "@/stores/install-prompt-store";
import type { BeforeInstallPromptEvent } from "@/types/pwa";
import { InstallNudge } from "../install-nudge";

/**
 * Stands in for the event Chromium fires. It cannot be constructed for real, so the
 * store is handed a shape that satisfies the two things the nudge does with it —
 * `prompt()` and `userChoice`.
 */
const fakeCapturedPrompt = (outcome: "accepted" | "dismissed") =>
  ({
    platforms: ["web"],
    prompt: () => Promise.resolve(),
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  }) as unknown as BeforeInstallPromptEvent;

/**
 * Puts the browser in the one state where the nudge is allowed to appear: a
 * signed-in user, the cookie question answered, an install on offer, and no record
 * of the nudge having run before.
 *
 * Returns a cleanup function, which Storybook runs after the story. Both stores here
 * are module-level singletons shared by every story in the browser, and
 * `localStorage` outlives the page — so without this, a later story would inherit a
 * signed-in user and a pending install prompt from this file.
 */
const givenAnEligibleBrowser = ({
  hasSeenNudge = false,
}: { hasSeenNudge?: boolean } = {}) => {
  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({
      choice: "all",
      savedAt: new Date().toISOString(),
      version: 1,
    }),
  );

  if (hasSeenNudge) {
    window.localStorage.setItem(
      INSTALL_NUDGE_STORAGE_KEY,
      JSON.stringify({ seenAt: new Date().toISOString(), version: 1 }),
    );
  } else {
    window.localStorage.removeItem(INSTALL_NUDGE_STORAGE_KEY);
  }

  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      provider: "password",
      role: "free",
      uid: "story-uid",
    },
  });

  useInstallPromptStore.setState({
    capturedPrompt: fakeCapturedPrompt("dismissed"),
    hasUsedPrompt: false,
    isInstalled: false,
  });

  return () => {
    window.localStorage.removeItem(INSTALL_NUDGE_STORAGE_KEY);
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    useAuthStore.setState({ status: "loading", user: null });
    useInstallPromptStore.setState({
      capturedPrompt: null,
      hasUsedPrompt: false,
      isInstalled: false,
    });
  };
};

/**
 * The container, driven through the real stores it reads in production.
 *
 * `InstallNudgeView` has its own stories for looks and copy; these are here for the
 * decisions only this component makes — the delay, the once-per-browser record, and
 * yielding to the update banner.
 */
const meta = {
  title: "Commons/Install Nudge/Behaviour",
  component: InstallNudge,
  parameters: { layout: "fullscreen" },
  args: {
    // Short enough to assert against, long enough that "appears immediately" would
    // still fail the first assertion below.
    delayMs: 150,
    isUpdateReady: false,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InstallNudge>;

export default meta;
type Story = StoryObj<typeof meta>;

const nudge = (canvas: ReturnType<typeof within>) =>
  canvas.queryByRole("region", { name: "Install Dokiments" });

export const AppearsAfterTheDelay: Story = {
  beforeEach: () => givenAnEligibleBrowser(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Nothing in the first frame: landing in the same paint as the page is how the
    // single appearance gets missed or swatted away.
    await expect(nudge(canvas)).not.toBeInTheDocument();

    await waitFor(() => expect(nudge(canvas)).toBeVisible());
  },
};

export const NeverAppearsTwice: Story = {
  beforeEach: () => givenAnEligibleBrowser(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(nudge(canvas)).toBeVisible());

    // The record is written when it appears, not when it is answered — so a user
    // who wanders off is not asked again either.
    await waitFor(() =>
      expect(window.localStorage.getItem(INSTALL_NUDGE_STORAGE_KEY)).toContain(
        '"version":1',
      ),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Not now" }));
    await expect(nudge(canvas)).not.toBeInTheDocument();
  },
};

export const StaysAwayOnceAlreadySeen: Story = {
  beforeEach: () => givenAnEligibleBrowser({ hasSeenNudge: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Well past the delay: a stored record means it has had its turn, forever.
    await new Promise((resolve) => setTimeout(resolve, 400));
    await expect(nudge(canvas)).not.toBeInTheDocument();
  },
};

export const YieldsToTheUpdateBanner: Story = {
  args: { isUpdateReady: true },
  beforeEach: () => givenAnEligibleBrowser(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((resolve) => setTimeout(resolve, 400));
    await expect(nudge(canvas)).not.toBeInTheDocument();

    // Crucially the record is untouched, so yielding costs the nudge nothing — it
    // still gets its one appearance on a later visit.
    await expect(
      window.localStorage.getItem(INSTALL_NUDGE_STORAGE_KEY),
    ).toBeNull();
  },
};

export const StaysAwayFromVisitorsWhoHaveNotSignedIn: Story = {
  beforeEach: () => {
    const cleanup = givenAnEligibleBrowser();
    useAuthStore.setState({ status: "unauthenticated", user: null });
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The marketing footer already carries a findable button; the one interruption
    // is saved for the dashboard, where it is buried in a drawer.
    await new Promise((resolve) => setTimeout(resolve, 400));
    await expect(nudge(canvas)).not.toBeInTheDocument();
  },
};

const IPHONE_INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 331.0.0.37.90 (iPhone15,2; iOS 17_5; en_US)";

export const StaysAwayInsideAnInAppBrowser: Story = {
  beforeEach: () => {
    const cleanup = givenAnEligibleBrowser();
    const realUserAgent = window.navigator.userAgent;

    // The guide is derived from the user agent, and an iOS webview is
    // indistinguishable from Safari by any feature test — so the user agent is the
    // only thing there is to stand in for one.
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: IPHONE_INSTAGRAM,
    });

    return () => {
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: realUserAgent,
      });
      cleanup();
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((resolve) => setTimeout(resolve, 400));

    // A pending install prompt is deliberately still in the store, so the only
    // thing keeping the nudge away is the guide — installing from here means going
    // out to Safari first, and the single interruption is worth more than a detour.
    await expect(nudge(canvas)).not.toBeInTheDocument();

    // And the record is untouched, so a later visit in a real browser still gets it.
    await expect(
      window.localStorage.getItem(INSTALL_NUDGE_STORAGE_KEY),
    ).toBeNull();
  },
};

export const LeavesOnceTheAppIsInstalled: Story = {
  beforeEach: () => givenAnEligibleBrowser(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(nudge(canvas)).toBeVisible());

    // What `appinstalled` does — including for an install started from the
    // browser's own menu while the banner is sitting there.
    useInstallPromptStore.getState().markInstalled();

    await waitFor(() => expect(nudge(canvas)).not.toBeInTheDocument());
  },
};
