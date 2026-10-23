import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getSampleValues, getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { CvDocument } from "../cv-document";

const sample = getSampleValues("cv");

const meta = {
  title: "Commons/CV Document",
  component: CvDocument,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[794px] bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    layout: "print",
    template: getTemplateById("classic-cv") as MarketplaceTemplate,
    values: sample,
  },
} satisfies Meta<typeof CvDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Classic: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Alex Morgan" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("meter", { name: "Financial Modelling: 90%" }),
    ).toBeVisible();
  },
};

export const Modern: Story = {
  args: { template: getTemplateById("modern-cv") as MarketplaceTemplate },
};

export const Brutalist: Story = {
  args: { template: getTemplateById("brutalist-cv") as MarketplaceTemplate },
};

export const Minimalist: Story = {
  args: { template: getTemplateById("minimalist-cv") as MarketplaceTemplate },
};

export const Empty: Story = {
  args: { values: {} },
};

export const OptionalSectionsOmitted: Story = {
  args: {
    values: {
      about: sample.about,
      experience: sample.experience,
      fullName: sample.fullName,
      jobTitle: sample.jobTitle,
      skills: sample.skills,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Education")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Languages")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Certificates")).not.toBeInTheDocument();
  },
};

export const Compact: Story = {
  args: { density: "compact", layout: "responsive" },
};

export const PlainSkillsAndCustomSection: Story = {
  args: { values: { ...sample, skillsDisplay: "list" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Volunteering" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("meter", { name: "Financial Modelling: 90%" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText("Financial Modelling")).toBeVisible();
  },
};

export const SkillsOmitted: Story = {
  args: { values: { ...sample, additional: "", skills: "" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("heading", { name: "Skills" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("heading", { name: "Volunteering" }),
    ).not.toBeInTheDocument();
  },
};
