import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CvSkillList } from "../cv-skill-list";

const meta = {
  title: "Commons/CV Skill List",
  component: CvSkillList,
  args: {
    chipClassName: "rounded-field bg-base-200 px-2 py-1",
    isCompact: false,
    names: ["Financial Modelling", "Microsoft Excel", "IFRS Reporting"],
  },
} satisfies Meta<typeof CvSkillList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
