import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { PdfWatermark } from "../pdf-watermark";

const meta = {
  title: "Dashboard/PDF Watermark",
  component: PdfWatermark,
  decorators: [
    (Story) => (
      <div style={{ width: "794px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PdfWatermark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("www.dokiments.com")).toBeVisible();
  },
};
