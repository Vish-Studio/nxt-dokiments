import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignInForm } from "../sign-in-form";

const meta = {
  title: "Commons/Sign In Form",
  component: SignInForm,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /sign in/i }),
    ).toBeVisible();
  },
};

/** How sign-in looks after a session hits its 1-day cap and the user is bounced
 * back here with `?expired=1`. The `notice` prop is passed directly so the story
 * doesn't depend on the URL. */
export const SessionExpired: Story = {
  args: {
    notice: "Your session expired after 24 hours. Please sign in again.",
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /session expired after 24 hours/i,
    );
  },
};

export const Validation: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
    await expect(await canvas.findByText("Email is required.")).toBeVisible();
    await expect(
      await canvas.findByText("Password is required."),
    ).toBeVisible();
  },
};
