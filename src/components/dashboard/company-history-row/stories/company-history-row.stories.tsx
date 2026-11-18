import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { northlineGroup } from "@/lib/storybook/company-document-fixtures";

import { CompanyHistoryRow } from "../company-history-row";

const created = northlineGroup.entries.find((entry) => entry.id === "doc:nl-1")!;
const received = northlineGroup.entries.find((entry) => entry.source === "received")!;

const meta = {
  title: "Dashboard/Company History Row",
  component: CompanyHistoryRow,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <ol className="w-[40rem] rounded-box bg-base-100 p-4">
        <Story />
      </ol>
    ),
  ],
  args: { entry: created, onOpen: fn(), onPrint: fn() },
} satisfies Meta<typeof CompanyHistoryRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Created by the user, shared and signed: export, edit, and the row previews. */
export const CreatedAndSigned: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Signed")).toBeVisible();
    await expect(canvas.getByText(/By you/)).toBeVisible();
    await expect(canvas.getByText("18 Jun 2026, 09:30")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Edit June retainer invoice" }),
    ).toHaveAttribute("href", "/my-documents?edit=nl-1");
    await userEvent.click(
      canvas.getByRole("button", { name: "Preview June retainer invoice" }),
    );
    await expect(args.onOpen).toHaveBeenCalledWith(created);
  },
};

/** Shared with the user by the company: opens the shared view. */
export const Received: Story = {
  args: { entry: received },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/From Alex Morgan/)).toBeVisible();
    await expect(canvas.getByText("Received")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Open Mutual NDA" }),
    ).toHaveAttribute("href", "/my-documents/shared/sh-in-1");
  },
};
