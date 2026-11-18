import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { northlineClient } from "@/lib/storybook/company-document-fixtures";

import {
  ClientInformationCard,
  CompanyInformationCard,
} from "../company-details-card";

const meta = {
  title: "Dashboard/Company Details Cards",
  component: ClientInformationCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { client: northlineClient, name: "Northline Studio" },
} satisfies Meta<typeof ClientInformationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The contact from My Clients; empty fields (national ID) are skipped. */
export const ClientInformation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
    await expect(canvas.queryAllByText("National ID")).toHaveLength(0);
    await expect(
      canvas.getByRole("link", { name: "View in My Clients" }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** Not in the client book: one line and a link to add it. */
export const ClientNotInMyClients: Story = {
  args: { client: undefined, name: "Lumina Events" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("link", { name: "Add to My Clients" }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** The business: name, BRN, address and the first / latest document dates. */
export const CompanyInformation: Story = {
  render: () => (
    <CompanyInformationCard
      client={northlineClient}
      firstAt={Date.UTC(2025, 11, 24)}
      latestAt={Date.UTC(2026, 5, 18)}
      name="Northline Studio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("C09876543")).toBeVisible();
    await expect(canvas.getByText("24 Market Street, Ebene")).toBeVisible();
    // Label shows once visibly and once for screen readers.
    await expect(canvas.getAllByText("First document").length).toBeGreaterThan(0);
  },
};
