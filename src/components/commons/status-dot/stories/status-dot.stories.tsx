import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { StatusDot } from "../status-dot";

const meta = {
  title: "Commons/Status Dot",
  component: StatusDot,
  args: { tone: "golden" },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Decorative: hidden from assistive tech. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".status-dot")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

/** Both sizes in every tone: `sm` inside pills, `md` on phone rows. */
export const AllTones: Story = {
  render: () => (
    <div className="grid gap-3">
      {(["sm", "md"] as const).map((size) => (
        <div
          className="flex items-center gap-3"
          key={size}
        >
          {(["golden", "blue", "green", "teal", "grey"] as const).map(
            (tone) => (
              <StatusDot
                key={tone}
                size={size}
                tone={tone}
              />
            ),
          )}
        </div>
      ))}
    </div>
  ),
};
