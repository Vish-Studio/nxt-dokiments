import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  noClientGroup,
  northlineGroup,
} from "@/lib/storybook/company-document-fixtures";

import { CompanyProfileHeader } from "../company-profile-header";

const meta = {
  title: "Dashboard/Company Profile Header",
  component: CompanyProfileHeader,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  args: {
    group: northlineGroup,
    newDocumentHref: "/my-documents?new=1&client=client_northline_01",
  },
} satisfies Meta<typeof CompanyProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Name as the heading, one explanatory sentence, and the two actions. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Northline Studio" }),
    ).toBeVisible();
    await expect(canvas.getByText(/Every document you've created for Northline Studio/)).toBeVisible();
    await expect(canvas.getByRole("link", { name: "View in My Clients" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /New document/ })).toBeVisible();
  },
};

export const NoClientYet: Story = {
  args: { group: noClientGroup, newDocumentHref: "/my-documents?new=1" },
};
