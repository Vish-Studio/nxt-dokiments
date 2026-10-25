import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { VERIFY_EMAIL_NOTICE_STORAGE_KEY } from "@/lib/email-verification-notice";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

import { VerifyEmailNotice } from "../verify-email-notice";

const storyUser: AuthUser = {
  displayName: "Story User",
  email: "story@dokiments.test",
  emailVerified: false,
  provider: "password",
  role: "free",
  uid: "story-user",
};

/** Seeds the auth store, clears any earlier dismissal and stubs `fetch` per route. */
const arrange = (
  user: AuthUser | null,
  handlers: Record<string, () => Response> = {},
) => {
  const originalFetch = window.fetch;

  window.sessionStorage.removeItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY);
  useAuthStore.setState({
    status: user ? "authenticated" : "unauthenticated",
    user,
  });
  window.fetch = async (input) => {
    const handler = handlers[String(input)];
    return handler ? handler() : new Response(null, { status: 204 });
  };

  return () => {
    window.fetch = originalFetch;
  };
};

const meta = {
  title: "Dashboard/Verify Email Notice",
  component: VerifyEmailNotice,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerifyEmailNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unverified: Story = {
  beforeEach: () => arrange(storyUser),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("story@dokiments.test")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Resend email" }),
    ).toBeEnabled();
  },
};

export const HiddenWhenVerified: Story = {
  beforeEach: () => arrange({ ...storyUser, emailVerified: true }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText(/to receive documents/i),
    ).not.toBeInTheDocument();
  },
};

export const HiddenWhenStatusUnknown: Story = {
  beforeEach: () => arrange({ ...storyUser, emailVerified: undefined }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText(/to receive documents/i),
    ).not.toBeInTheDocument();
  },
};

export const ResendStartsCooldown: Story = {
  beforeEach: () => arrange(storyUser),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Resend email" }),
    );
    await expect(
      await canvas.findByText(/sent a verification link/i),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /Resend in \d+s/ }),
    ).toBeDisabled();
  },
};

export const ResendThrottled: Story = {
  beforeEach: () =>
    arrange(storyUser, {
      "/api/auth/send-verification": () =>
        new Response(
          JSON.stringify({
            error: "Too many attempts. Please try again later.",
          }),
          { status: 429 },
        ),
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Resend email" }),
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
    await expect(
      canvas.getByRole("button", { name: "Resend email" }),
    ).toBeEnabled();
  },
};

export const NotVerifiedYet: Story = {
  beforeEach: () =>
    arrange(storyUser, {
      "/api/auth/refresh-verification": () =>
        Response.json({ user: storyUser }),
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "I've verified" }),
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Not verified yet",
    );
  },
};

export const VerifiedAfterCheck: Story = {
  beforeEach: () =>
    arrange(storyUser, {
      "/api/auth/refresh-verification": () =>
        Response.json({ user: { ...storyUser, emailVerified: true } }),
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "I've verified" }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: "I've verified" }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const Dismissed: Story = {
  beforeEach: () => arrange(storyUser),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Dismiss verification notice",
      }),
    );
    await expect(
      canvas.queryByRole("button", { name: "I've verified" }),
    ).not.toBeInTheDocument();
    await expect(
      window.sessionStorage.getItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY),
    ).toBe("true");
  },
};
