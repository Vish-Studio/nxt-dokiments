import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { SignSharePreview } from "../sign-share-preview";

const meta = {
  title: "Website/Sign Share Preview",
  component: SignSharePreview,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignSharePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A still of the share dialog with a recipient chosen. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Recipient email")).toHaveValue(
      "maya@northline.com",
    );
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
  },
};
