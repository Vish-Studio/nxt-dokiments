import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { CvSkillsDisplayField } from "../cv-skills-display-field";

const meta = {
  title: "Commons/CV Skills Display Field",
  component: CvSkillsDisplayField,
  args: { onChange: fn(), value: "" },
} satisfies Meta<typeof CvSkillsDisplayField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bars: Story = {};
export const PlainList: Story = { args: { value: "list" } };
