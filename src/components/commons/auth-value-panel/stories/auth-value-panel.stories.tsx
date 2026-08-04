import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthValuePanel } from "../auth-value-panel";

const meta = {
  title: "Commons/Auth Value Panel",
  component: AuthValuePanel,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-nox-noir p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthValuePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
