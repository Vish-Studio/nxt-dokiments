import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  noClientGroup,
  northlineGroup,
} from "@/lib/storybook/company-document-fixtures";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

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
  },
} satisfies Meta<typeof CompanyDocumentsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Compact summary; the whole card opens the company page. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Northline Studio" }),
    ).toBeVisible();
    await expect(canvas.getByText("Contact: Maya Chen")).toBeVisible();

    // One line of figures: signatures with sharing on, types with it off.
    await expect(canvas.getByTestId("company-figures")).toHaveTextContent(
      documentSharingEnabled
        ? "5 documents · 1 signed · 0 awaiting"
        : "5 documents · 4 types",
    );
    await expect(canvas.getByText("June retainer invoice")).toBeVisible();

    // The card-wide link covers the whole card (inside its 1px border).
    const cardLink = canvas.getByRole("link", {
      name: "View company Northline Studio",
    });
    await expect(cardLink).toHaveAttribute("href", args.href);
    const card = canvasElement.querySelector(".company-documents-card")!;
    await expect(cardLink.getBoundingClientRect().height).toBe(
      card.getBoundingClientRect().height - 2,
    );

    // Quick action sits above the cover and keeps its own target.
    await expect(
      canvas.getByRole("link", { name: "New document for Northline Studio" }),
    ).toHaveAttribute(
      "href",
      "/my-documents?new=1&client=client_northline_01",
    );
  },
};

/** Documents with no client name get a dashed card and no quick action. */
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

/** A company typed by name but not in My Clients: the quick action prefills the name. */
export const NotInMyClients: Story = {
  args: {
    group: { ...northlineGroup, client: undefined, key: "name-northline-studio" },
    href: "/my-documents/companies/name-northline-studio",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Not in My Clients")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "New document for Northline Studio" }),
    ).toHaveAttribute("href", "/my-documents?new=1&company=Northline%20Studio");
  },
};
