import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthMobileIntro } from "../auth-mobile-intro";

const meta = {
  title: "Commons/Auth Mobile Intro",
  component: AuthMobileIntro,
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthMobileIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
