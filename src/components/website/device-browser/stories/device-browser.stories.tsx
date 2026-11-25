import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { appScreens } from "@/lib/website/app-screens";

import { DeviceBrowser } from "../device-browser";

const meta = {
  title: "Website/Device Browser",
  component: DeviceBrowser,
  parameters: { layout: "fullscreen" },
  args: {
    alt: appScreens.dashboard.alt,
    height: appScreens.dashboard.height,
    sizes: "720px",
    src: appScreens.dashboard.src,
    width: appScreens.dashboard.width,
  },
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-10">
        <div className="max-w-3xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof DeviceBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On a nox-noir panel: a faint white ring around the window. */
export const Dark: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByAltText(/The Dokiments dashboard/),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("dokiments.com/dashboard"),
    ).toBeInTheDocument();
  },
};

/** On a light panel: a hairline ring and the soft shadow. */
export const Light: Story = {
  args: { tone: "light", url: "dokiments.com/my-documents" },
  decorators: [
    (Story) => (
      <div className="bg-play-blue p-10">
        <div className="max-w-3xl">
          <Story />
        </div>
      </div>
    ),
  ],
};
