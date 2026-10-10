import { FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { BentoCell } from "../bento-cell";

const meta = {
  title: "Website/Bento Cell",
  component: BentoCell,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-pink",
    description:
      "Finish a document and download it as a PDF, ready to send to your client.",
    icon: FilePdf,
    title: "Export as a PDF",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BentoCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /export as a pdf/i }),
    ).toBeVisible();
  },
};

export const Featured: Story = {
  args: {
    accent: "bg-golden-harvest",
    children: (
      <p className="font-title font-bold">
        Marketplace to My Templates to Documents
      </p>
    ),
    featured: true,
  },
};
