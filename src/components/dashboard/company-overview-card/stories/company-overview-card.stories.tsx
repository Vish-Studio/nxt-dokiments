import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { northlineGroup } from "@/lib/storybook/company-document-fixtures";

import { CompanyOverviewCard } from "../company-overview-card";

const meta = {
  title: "Dashboard/Company Overview Card",
  component: CompanyOverviewCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: { group: northlineGroup },
} satisfies Meta<typeof CompanyOverviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four grey snapshot rows, like the dashboard's "Workspace snapshot". */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Created by you").closest("dt")?.nextElementSibling).toHaveTextContent("4");
    await expect(canvas.getByText("Shared with you").closest("dt")?.nextElementSibling).toHaveTextContent("1");
  },
};
