import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageHeaderVisual } from "../page-header-visual";

const meta = {
  title: "Dashboard/Page Header Visual",
  component: PageHeaderVisual,
  decorators: [
    (Story) => (
      <div className="w-32 bg-play-teal p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "marketplace",
  },
} satisfies Meta<typeof PageHeaderVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Marketplace: Story = {};

export const Documents: Story = {
  args: { variant: "documents" },
};

export const Templates: Story = {
  args: { variant: "templates" },
};

export const Subscription: Story = {
  args: { variant: "subscription" },
};

export const Settings: Story = {
  args: { variant: "settings" },
};
