import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";

import { DashboardListRow } from "../dashboard-list-row";

const meta = {
  title: "Dashboard/Dashboard List Row",
  component: DashboardListRow,
  decorators: [
    (Story) => (
      <ul className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <Story />
      </ul>
    ),
  ],
  args: {
    onSelect: fn(),
    selectLabel: "Open Maya Chen",
  },
} satisfies Meta<typeof DashboardListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Display-only cells: the whole row is one target. */
export const Selectable: Story = {
  args: {
    children: (
      <div className="pointer-events-none relative z-10 sm:col-span-12">
        <p className="font-title text-sm font-bold text-nox-noir">Maya Chen</p>
      </div>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Maya Chen" }),
    );
    await expect(args.onSelect).toHaveBeenCalledOnce();
  },
};

/**
 * A row that also holds its own button. The overlay sits at `z-0`, so a cell
 * lifted to `z-20` stays clickable — this is the layering the row exists to keep
 * correct in one place.
 */
export const WithRowActions: Story = {
  args: {
    children: (
      <>
        <div className="pointer-events-none relative z-10 sm:col-span-10">
          <p className="font-title text-sm font-bold text-nox-noir">
            Maya Chen
          </p>
        </div>
        <div className="relative z-20 flex justify-end sm:col-span-2">
          <ButtonIcon
            aria-label="Delete Maya Chen"
            icon={<span aria-hidden>×</span>}
            shape="square"
            size="sm"
            variant="danger"
          />
        </div>
      </>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Clicking the action must not also trigger the row overlay behind it.
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete Maya Chen" }),
    );
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

/** No `onSelect`: a plain row with no overlay button at all. */
export const Static: Story = {
  args: {
    onSelect: undefined,
    selectLabel: undefined,
    children: (
      <div className="sm:col-span-12">
        <p className="text-sm text-nox-noir/60">Not interactive</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
