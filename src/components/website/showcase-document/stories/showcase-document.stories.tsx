import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ShowcaseDocument } from "../showcase-document";

const meta = {
  title: "Website/Showcase Document",
  component: ShowcaseDocument,
  args: { className: "w-56 -rotate-3", templateId: "classic-quotation" },
  decorators: [
    (Story) => (
      <div className="flex justify-center rounded-box bg-play-teal p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShowcaseDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A real catalog quotation, filled with its sample content. */
export const Quotation: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector(".showcase-document"),
    ).not.toBeNull();
  },
};

export const Contract: Story = { args: { templateId: "classic-contract" } };

/** An unknown id renders nothing rather than breaking the page. */
export const UnknownTemplate: Story = {
  args: { templateId: "classic-missing" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".showcase-document")).toBeNull();
  },
};
