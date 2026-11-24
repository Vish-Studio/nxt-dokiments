import { UsersThreeIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
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

/** The one action that gets the user out of the state sits under the text. */
export const WithAction: Story = {
  args: {
    action: <Button size="sm">Add client</Button>,
    description: "Add a client to keep their details close at hand.",
    title: "No clients yet",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Add client" }),
    ).toBeVisible();
  },
};

/** A failed request: red, announced as an alert, with a way to retry. */
export const ErrorTone: Story = {
  args: {
    action: <Button size="sm" variant="outline">Try again</Button>,
    description: "Your clients are saved to your account. Check your connection and try again.",
    icon: <WarningCircleIcon aria-hidden size={iconSize.feature} weight="bold" />,
    title: "Couldn't load your clients",
    tone: "error",
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("Couldn't load your clients");
    await expect(within(alert).getByRole("button", { name: "Try again" })).toBeVisible();
  },
};
