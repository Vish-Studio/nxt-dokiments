import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { VERIFY_EMAIL_NOTICE_STORAGE_KEY } from "@/lib/email-verification-notice";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

import { ProfileEmailVerification } from "../profile-email-verification";

const user: AuthUser = {
  displayName: "Profile User",
  email: "profile@dokiments.test",
  emailVerified: false,
  provider: "password",
  role: "free",
  uid: "profile-user",
};

const arrange = (
  emailVerified: boolean | undefined,
  refreshedStatus = emailVerified,
) => {
  const originalFetch = window.fetch;
  const originalDismissal = sessionStorage.getItem(
    VERIFY_EMAIL_NOTICE_STORAGE_KEY,
  );
  sessionStorage.setItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY, "true");
  useAuthStore.setState({
    status: "authenticated",
    user: { ...user, emailVerified },
  });
  window.fetch = async () =>
    Response.json({ user: { ...user, emailVerified: refreshedStatus } });

  return () => {
    window.fetch = originalFetch;
    if (originalDismissal === null) {
      sessionStorage.removeItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY);
    } else {
      sessionStorage.setItem(
        VERIFY_EMAIL_NOTICE_STORAGE_KEY,
        originalDismissal,
      );
    }
  };
};

const meta = {
  title: "Dashboard/Profile Email Verification",
  component: ProfileEmailVerification,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl bg-base-200 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileEmailVerification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verified: Story = {
  beforeEach: () => arrange(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Verified")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Resend email" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "I've verified" }),
    ).not.toBeInTheDocument();
  },
};

export const UnverifiedDespiteDismissedNotice: Story = {
  beforeEach: () => arrange(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Not verified")).toBeVisible();
    await expect(canvas.getByText(user.email)).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Resend email" }),
    ).toBeEnabled();
  },
};

export const Unknown: Story = {
  beforeEach: () => arrange(undefined, true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Verified")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Not verified")).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "I've verified" }),
    );
    await expect(await canvas.findByText("Verified")).toBeVisible();
  },
};

export const VerifiedAfterCheck: Story = {
  beforeEach: () => arrange(false, true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "I've verified" }),
    );
    await expect(await canvas.findByText("Verified")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Resend email" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "I've verified" }),
    ).not.toBeInTheDocument();
    await expect(useAuthStore.getState().user?.emailVerified).toBe(true);
  },
};

export const StillUnverified: Story = {
  beforeEach: () => arrange(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "I've verified" }),
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Not verified yet",
    );
    await expect(canvas.getByText("Not verified")).toBeVisible();
  },
};

export const LongEmailOnMobile: Story = {
  beforeEach: () => {
    const cleanup = arrange(false);
    useAuthStore.setState({
      user: { ...user, email: `${"long".repeat(12)}@dokiments.test` },
    });
    return cleanup;
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
