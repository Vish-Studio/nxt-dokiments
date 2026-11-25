import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignShowcaseMockup } from "../sign-showcase-mockup";

const meta = {
  title: "Website/Sign Showcase Mockup",
  component: SignShowcaseMockup,
  decorators: [
    (Story) => (
      <div className="max-w-xl p-10 pb-20">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignShowcaseMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Share, then signed: the dialog still, the real status badge, audit trail,
 * signature and notification. All decorative, so nothing is focusable.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".sign-showcase-mockup");
    await expect(root).toHaveAttribute("inert");
    await expect(root).toHaveTextContent("Share this document");
    await expect(root).toHaveTextContent("Signed by maya@northline.com");
    await expect(root).toHaveTextContent(
      "maya@northline.com signed a document",
    );
  },
};
