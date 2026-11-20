import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { PageBackButton } from "../page-back-button";

const meta = {
  title: "Dashboard/Page Back Button",
  component: PageBackButton,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="rounded-box bg-play-purple p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    back: { href: "/my-documents", label: "Companies" },
    className: "border-none bg-white/45 text-nox-noir hover:bg-white/65",
  },
} satisfies Meta<typeof PageBackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A link back to a route. */
export const Link: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("link", { name: "Back to Companies" }),
    ).toHaveAttribute("href", "/my-documents");
  },
};

/** An in-page step back, e.g. the editor returning to the list. */
export const Action: Story = {
  args: { back: { label: "My documents", onClick: fn() } },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Back to My documents" }),
    );
    await expect(args.back.onClick).toHaveBeenCalled();
  },
};
