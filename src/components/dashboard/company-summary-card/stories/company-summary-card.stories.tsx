import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  noClientGroup,
  northlineGroup,
} from "@/lib/storybook/company-document-fixtures";

import { CompanySummaryCard } from "../company-summary-card";

const meta = {
  title: "Dashboard/Company Summary Card",
  component: CompanySummaryCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    group: northlineGroup,
    newDocumentHref: "/my-documents?new=1&client=client_northline_01",
  },
} satisfies Meta<typeof CompanySummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Phones: who the company is, how to reach them, and New document. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Northline Studio" }),
    ).toBeVisible();
    await expect(canvas.getByText("Contact: Maya Chen")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:accounts@northline.com",
    );
    await expect(canvas.getByRole("link", { name: "Call" })).toHaveAttribute(
      "href",
      "tel:+23059876543",
    );
    await expect(
      canvas.getByRole("link", { name: "New document for Northline Studio" }),
    ).toHaveAttribute("href", args.newDocumentHref);
    await expect(canvas.getByText("C09876543")).toBeVisible();
  },
};

/** A company outside My Clients: no contact shortcuts, a link to add it. */
export const NotInMyClients: Story = {
  args: {
    group: { ...northlineGroup, client: undefined },
    newDocumentHref: "/my-documents?new=1&company=Northline%20Studio",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("link", { name: "Call" })).toBeNull();
    await expect(
      canvas.getByRole("link", { name: "Add to My Clients" }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** Documents without a client. */
export const NoClientYet: Story = {
  args: { group: noClientGroup, newDocumentHref: "/my-documents?new=1" },
};
