import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ConversionCtaDocuments } from "../conversion-cta-documents";

const meta = {
  title: "Website/Conversion CTA Documents",
  component: ConversionCtaDocuments,
  decorators: [
    (Story) => (
      <div className="h-80 w-[26rem] overflow-hidden rounded-box bg-golden-harvest p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConversionCtaDocuments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Quotation, invoice and a signed contract, fanned and clipped. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll(".showcase-document"),
    ).toHaveLength(3);
    await expect(
      canvasElement.querySelector(".conversion-cta-documents"),
    ).toHaveAttribute("inert");
  },
};
