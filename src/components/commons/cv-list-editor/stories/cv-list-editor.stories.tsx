import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { readCvList, writeCvList } from "@/lib/market-place/cv-lists";

import { CvListEditor } from "../cv-list-editor";

const meta = {
  title: "Commons/CV List Editor",
  component: CvListEditor,
  args: { listKey: "skills", onChange: fn(), value: "" },
} satisfies Meta<typeof CvListEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Add skill" }),
    );
    const encoded = args.onChange.mock.calls[0][0];
    await expect(readCvList(encoded)).toEqual([{ level: "70", name: "" }]);
  },
};

export const Skills: Story = {
  args: {
    value: writeCvList([
      { level: "90", name: "Financial Modelling" },
      { level: "80", name: "React" },
    ]),
  },
};

export const Experience: Story = {
  args: {
    listKey: "experience",
    value: writeCvList([
      {
        company: "Rapp IO",
        description: "Built web apps.",
        period: "2021 - 2022",
        title: "Financial Analyst",
      },
    ]),
  },
};

export const LegacyTextPreserved: Story = {
  args: { listKey: "experience", value: "Worked at Acme" },
  play: async ({ canvasElement, args }) => {
    await expect(
      within(canvasElement).getByDisplayValue("Worked at Acme"),
    ).toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Add experience" }),
    );
    const rows = readCvList(args.onChange.mock.calls[0][0]);
    await expect(rows?.[0].title).toBe("Worked at Acme");
  },
};
