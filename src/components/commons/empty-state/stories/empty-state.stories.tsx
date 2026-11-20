import { UsersThreeIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { iconSize } from "@/lib/icons";

import { EmptyState } from "../empty-state";

const meta = {
  title: "Commons/Empty State",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    description:
      "Documents other people share with you appear here once you sign in with the email address they used.",
    icon: (
      <UsersThreeIcon
        aria-hidden
        size={iconSize.feature}
        weight="bold"
      />
    ),
    title: "Nothing shared with you yet",
  },
  decorators: [
    (Story) => (
      <div className="flex h-[32rem] flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fills its flex-column parent, with the content grouped in the middle. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Nothing shared with you yet",
    });
    const box = heading.closest(".empty-state") as HTMLElement;
    const parent = box.parentElement as HTMLElement;
    await expect(box.getBoundingClientRect().height).toBe(
      parent.getBoundingClientRect().height,
    );
    // Title and description sit together, not at opposite ends of the box.
    const text = canvas.getByText(/appear here once you sign in/);
    await expect(
      text.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
    ).toBeLessThan(16);
  },
};

export const WithoutIcon: Story = {
  args: { icon: undefined, title: "No documents yet" },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
