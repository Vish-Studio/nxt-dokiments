import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { EmailVerificationActions } from "../email-verification-actions";

const mockApi = (response: () => Response) => {
  const originalFetch = window.fetch;
  window.fetch = async () => response();
  return () => {
    window.fetch = originalFetch;
  };
};

const meta = {
  title: "Dashboard/Email Verification Actions",
  component: EmailVerificationActions,
  args: { email: "profile@dokiments.test" },
} satisfies Meta<typeof EmailVerificationActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Resend: Story = {
  beforeEach: () => mockApi(() => new Response(null, { status: 204 })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Resend email" }));
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "We sent a verification link to profile@dokiments.test.",
    );
    await expect(
      canvas.getByRole("button", { name: /Resend in \d+s/ }),
    ).toBeDisabled();
  },
};

export const Throttled: Story = {
  beforeEach: () =>
    mockApi(() =>
      Response.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      ),
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Resend email" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
    await expect(
      canvas.getByRole("button", { name: "Resend email" }),
    ).toBeEnabled();
  },
};

export const CheckFailed: Story = {
  beforeEach: () =>
    mockApi(() =>
      Response.json(
        { error: "Service unavailable. Please try again." },
        { status: 503 },
      ),
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "I've verified" }),
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Service unavailable",
    );
    await expect(
      canvas.getByRole("button", { name: "I've verified" }),
    ).toBeEnabled();
  },
};
