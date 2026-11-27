import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { TemplatePickerSkeleton } from "../template-picker-skeleton";

const meta = {
  title: "Dashboard/Template Picker/Skeleton",
  component: TemplatePickerSkeleton,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[40rem] flex-col bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TemplatePickerSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "Loading your templates…",
      }),
    ).toBeInTheDocument();
  },
};

/** Phones: list rows only, no preview pane. */
export const Phone: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
