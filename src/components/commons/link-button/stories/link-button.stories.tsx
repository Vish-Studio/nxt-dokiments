import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkButton } from "../link-button";

const meta = {
  title: "Commons/Link Button",
  component: LinkButton,
  args: {
    children: "Sign up",
    href: "/sign-up",
  },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Accent: Story = {
  args: {
    variant: "accent",
  },
};

export const OutlineDark: Story = {
  args: {
    variant: "outlineDark",
  },
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
};
