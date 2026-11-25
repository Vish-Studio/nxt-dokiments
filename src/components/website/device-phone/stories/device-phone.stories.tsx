import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { appScreens } from "@/lib/website/app-screens";

import { DevicePhone } from "../device-phone";

const meta = {
  title: "Website/Device Phone",
  component: DevicePhone,
  parameters: { layout: "fullscreen" },
  args: {
    alt: appScreens.companyPhone.alt,
    height: appScreens.companyPhone.height,
    sizes: "280px",
    src: appScreens.companyPhone.src,
    width: appScreens.companyPhone.width,
  },
  decorators: [
    (Story) => (
      <div className="flex gap-10 bg-play-purple p-10">
        <div className="w-72">
          <Story />
        </div>
        <div className="w-40">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof DevicePhone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The frame scales with its width: the same phone at 288px and 160px. */
export const Scales: Story = {
  args: { tone: "light" },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByAltText(/Dokiments on a phone/)).toHaveLength(
      2,
    );
    // The status bar and camera island are decorative.
    for (const clock of canvas.getAllByText("9:41")) {
      await expect(clock.closest("[aria-hidden]")).not.toBeNull();
    }
  },
};

export const Notifications: Story = {
  args: {
    alt: appScreens.notificationsPhone.alt,
    height: appScreens.notificationsPhone.height,
    src: appScreens.notificationsPhone.src,
    tone: "light",
    width: appScreens.notificationsPhone.width,
  },
};
