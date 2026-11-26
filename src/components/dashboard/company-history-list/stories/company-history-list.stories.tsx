import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { northlineGroup } from "@/lib/storybook/company-document-fixtures";

import { CompanyHistoryList } from "../company-history-list";

const meta = {
  title: "Dashboard/Company History List",
  component: CompanyHistoryList,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  args: {
    companyName: "Northline Studio",
    entries: northlineGroup.entries,
    onOpen: fn(),
    onPrint: fn(),
  },
} satisfies Meta<typeof CompanyHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowsOf = (canvasElement: HTMLElement) =>
  within(
    within(canvasElement).getByRole("region", { name: "Documents" }),
  ).getAllByRole("listitem");

/** Both directions newest first; the chips and the type dropdown narrow it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(rowsOf(canvasElement)).toHaveLength(5);

    await userEvent.click(canvas.getByRole("button", { name: /^Shared with you/ }));
    await expect(rowsOf(canvasElement)).toHaveLength(1);

    await userEvent.click(canvas.getByRole("button", { name: /^All/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Document type" }));
    await userEvent.click(
      canvas.getByRole("menuitemradio", { name: "Invoice (2)" }),
    );
    await expect(rowsOf(canvasElement)).toHaveLength(2);
  },
};
