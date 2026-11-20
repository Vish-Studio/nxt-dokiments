import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { companyStoryGroups } from "@/lib/storybook/company-document-fixtures";

import { CompanyDocumentGroups } from "../company-document-groups";
import { CompanyDocumentGroupsSkeleton } from "../company-document-groups-skeleton";

const meta = {
  title: "Dashboard/Company Document Groups",
  component: CompanyDocumentGroups,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    groups: companyStoryGroups,
    onDownload: fn(),
    onEdit: fn(),
    onOpenEntry: fn(),
    onShare: fn(),
  },
} satisfies Meta<typeof CompanyDocumentGroups>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One section per company; rows open the preview or the shared view. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = canvas.getByRole("region", { name: "Northline Studio" });
    await expect(
      within(northline).getByRole("list", { name: "Documents for Northline Studio" }),
    ).toBeVisible();

    await userEvent.click(
      within(northline).getByRole("button", { name: "Preview June retainer invoice" }),
    );
    await expect(args.onOpenEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc:nl-1" }),
    );
    // Received documents open the shared view instead.
    await expect(
      within(northline).getByRole("button", { name: "Open Mutual NDA" }),
    ).toBeVisible();

    // Amounts show at a glance: typed currency kept, plain numbers formatted.
    await expect(within(northline).getByText("1,250.00")).toBeVisible();

    // The vertical menu: Edit, Download PDF and Share for own documents.
    await userEvent.click(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: "Download PDF" }));
    await expect(args.onDownload).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );
    await userEvent.click(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    );
    await userEvent.click(await body.findByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );

    // No "+" for documents without a client.
    const noClient = canvas.getByRole("region", { name: "No client yet" });
    await expect(
      within(noClient).queryByRole("link", { name: /^New document/ }),
    ).toBeNull();
  },
};

/** Long groups show the first few documents and "Show N more". */
export const ShowMore: Story = {
  args: { previewCount: 2 },
  play: async ({ canvasElement }) => {
    const northline = within(
      within(canvasElement).getByRole("region", { name: "Northline Studio" }),
    );
    await expect(northline.getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(northline.getByRole("button", { name: "Show 3 more" }));
    await expect(northline.getAllByRole("listitem")).toHaveLength(5);
    await expect(northline.getByRole("button", { name: "Show less" })).toBeVisible();
  },
};

/** Search or filters left nothing. */
export const NoMatches: Story = {
  args: { groups: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("No documents match"),
    ).toBeVisible();
  },
};

/** Loading: header-and-rows shimmer plus one status message. */
export const Loading: Story = {
  render: () => <CompanyDocumentGroupsSkeleton />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", { name: /loading your documents/i }),
    ).toBeInTheDocument();
  },
};
