import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ForgotPasswordForm } from "../forgot-password-form";

const meta = {
  title: "Commons/Forgot Password Form",
  component: ForgotPasswordForm,
  tags: ["ai-generated"],
  args: {
    onSubmit: async () => undefined,
  },
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /send reset link/i })).toBeVisible();
  },
};

export const Success: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "person@dokiments.test");
    await userEvent.click(canvas.getByRole("button", { name: /send reset link/i }));
    await expect(await canvas.findByText("Password reset email sent. Check your inbox.")).toBeVisible();
  },
};

/** Exercises the real `useForgotPasswordMutation` path (no `onSubmit` override) against a mocked `POST /api/auth/forgot-password`. */
export const RealMutation: Story = {
  args: { onSubmit: undefined },
  decorators: [
    (Story) => {
      window.fetch = (async (url: string) => {
        if (url.includes("/api/auth/forgot-password")) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: "Unhandled in story mock" }), { status: 500 });
      }) as typeof window.fetch;
      return <Story />;
    },
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "person@dokiments.test");
    await userEvent.click(canvas.getByRole("button", { name: /send reset link/i }));
    await expect(await canvas.findByText("Password reset email sent. Check your inbox.")).toBeVisible();
  },
};
