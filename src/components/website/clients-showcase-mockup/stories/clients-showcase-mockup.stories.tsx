import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClientsShowcaseMockup } from "../clients-showcase-mockup";

const meta = {
  title: "Website/Clients Showcase Mockup",
  component: ClientsShowcaseMockup,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClientsShowcaseMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
