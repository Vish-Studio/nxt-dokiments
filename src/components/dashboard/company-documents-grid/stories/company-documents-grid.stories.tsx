import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { companyStoryGroups } from "@/lib/storybook/company-document-fixtures";

import { CompanyDocumentsGrid } from "../company-documents-grid";
import { CompanyDocumentsGridSkeleton } from "../company-documents-grid-skeleton";

const meta = {
  title: "Dashboard/Company Documents Grid",
  component: CompanyDocumentsGrid,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    groups: companyStoryGroups,
  },
} satisfies Meta<typeof CompanyDocumentsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Companies by latest activity; "No client yet" always last. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const cards = within(
      within(canvasElement).getByRole("list", { name: "Companies" }),
    ).getAllByRole("article");
    await expect(cards).toHaveLength(3);
    await expect(cards[2]).toHaveAccessibleName("No client yet");
  },
};

/** Search or filters left nothing. */
export const NoMatches: Story = {
  args: { groups: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("No companies match"),
    ).toBeVisible();
  },
};

/** Loading state: card-shaped shimmer plus one status message. */
export const Loading: Story = {
  render: () => <CompanyDocumentsGridSkeleton />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: /loading your documents/i,
      }),
    ).toBeInTheDocument();
  },
};
