import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { PushNotificationCard } from "../push-notification-card";

const meta = {
  args: {
    onDisable: fn(),
    onEnable: fn(),
    onSendTest: fn(),
    status: "off",
  },
  component: PushNotificationCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  title: "Dashboard/Push Notification Card",
} satisfies Meta<typeof PushNotificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Turn on notifications" }),
    );
    await expect(args.onEnable).toHaveBeenCalledOnce();
  },
};

export const Enabling: Story = {
  args: { isEnabling: true },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole("button", {
        name: "Turning on…",
      }),
    ).toBeDisabled();
  },
};

export const On: Story = {
  args: { status: "on" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("On")).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "Send test notification" }),
    );
    await expect(args.onSendTest).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Turn off" }));
    await expect(args.onDisable).toHaveBeenCalledOnce();
  },
};

export const SendingTest: Story = {
  args: { isSendingTest: true, status: "on" },
};

export const Loading: Story = { args: { status: "loading" } };

export const Blocked: Story = {
  args: { status: "blocked" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/blocked for Dokiments/),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const InstallRequiredOnIos: Story = {
  args: { status: "install-required" },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/Add to Home Screen/),
    ).toBeInTheDocument();
  },
};

export const Unsupported: Story = {
  args: { status: "unsupported" },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/doesn't support push/),
    ).toBeInTheDocument();
  },
};

export const Phone: Story = {
  args: { status: "on" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
