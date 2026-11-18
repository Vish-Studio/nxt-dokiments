import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  noClientGroup,
  northlineGroup,
} from "@/lib/storybook/company-document-fixtures";

import { CompanyDocumentsCard } from "../company-documents-card";

const meta = {
  title: "Dashboard/Company Documents Card",
  component: CompanyDocumentsCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="flex w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    group: northlineGroup,
    href: "/my-documents/companies/client-client_northline_01",
    onOpenEntry: fn(),
  },
} satisfies Meta<typeof CompanyDocumentsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both directions: a received NDA is tagged and opens instead of previewing. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Northline Studio" }),
    ).toBeVisible();
    await expect(canvas.getByText(/^5 documents · latest/)).toBeVisible();
    await expect(canvas.getByText("shared with you")).toBeVisible();
    const viewAll = canvas.getByRole("link", {
      name: "View company Northline Studio",
    });
    await expect(viewAll).toHaveAttribute("href", args.href);
    await expect(viewAll).toHaveTextContent("View all 5");
    // Quick action: a new document with the client already picked.
    await expect(
      canvas.getByRole("link", { name: "New document for Northline Studio" }),
    ).toHaveAttribute(
      "href",
      "/my-documents?new=1&client=client_northline_01",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Preview June retainer invoice" }),
    );
    await expect(args.onOpenEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc:nl-1", source: "created" }),
    );
  },
};

/** Documents with no client name get a dashed card and no "New document". */
export const NoClientYet: Story = {
  args: { group: noClientGroup, href: "/my-documents/companies/no-client" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "No client yet" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("link", { name: /^New document/ }),
    ).not.toBeInTheDocument();
  },
};

/** A company typed by name but not in My Clients: the CTA prefills the name. */
export const NotInMyClients: Story = {
  args: {
    group: { ...northlineGroup, client: undefined, key: "name-northline-studio" },
    href: "/my-documents/companies/name-northline-studio",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("link", {
        name: "New document for Northline Studio",
      }),
    ).toHaveAttribute("href", "/my-documents?new=1&company=Northline%20Studio");
  },
};
