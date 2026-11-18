import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { northlineClient } from "@/lib/storybook/company-document-fixtures";

import { CompanyDetailsCard } from "../company-details-card";

const meta = {
  title: "Dashboard/Company Details Card",
  component: CompanyDetailsCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { client: northlineClient, name: "Northline Studio" },
} satisfies Meta<typeof CompanyDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The client-book record as plain label / value pairs. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("24 Market Street, Ebene")).toBeVisible();
  },
};

/** Not in the client book: one line and a link to add it. */
export const NotInMyClients: Story = {
  args: { client: undefined, name: "Lumina Events" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("link", { name: "Go to My Clients" }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** Documents with no client at all. */
export const NoClient: Story = {
  args: { client: undefined, name: null },
};
