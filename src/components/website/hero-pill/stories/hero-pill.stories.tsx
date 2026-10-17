import { UserCheck } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HeroPill } from "../hero-pill";

const meta = {
  title: "Website/Hero Pill",
  component: HeroPill,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
  args: { accent: "bg-play-blue", icon: UserCheck, label: "Client prefilled" },
} satisfies Meta<typeof HeroPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
