import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SettingsTabs } from "@/components/dashboard/settings-tabs/settings-tabs";
import { useAuthStore } from "@/stores/auth-store";

import { AppShell } from "../app-shell";

const meta = {
  title: "Dashboard/App Shell",
  component: AppShell,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    useAuthStore.setState({
      status: "authenticated",
      user: {
        displayName: "Anthony Alverizko",
        email: "anthony@dokiments.test",
        provider: "password",
        role: "free",
        uid: "story-user",
      },
    });
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /collapse sidebar/i })).toBeVisible();
  },
};

/** Settings fills the panel on desktop; only the active section scrolls. */
export const SettingsPage: Story = {
  args: {
    activeItem: "Settings",
    children: <SettingsTabs />,
    title: "Settings",
  },
  beforeEach: Default.beforeEach,
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("tabpanel", { name: "My profile" }),
    ).toBeVisible();
  },
};
