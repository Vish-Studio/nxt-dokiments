import { FileTextIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Input } from "@/components/commons/input/input";

import { FormAccordionSection } from "../form-accordion-section";

const meta = {
  title: "Commons/Form Accordion Section",
  component: FormAccordionSection,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <Input
        label="Invoice number"
        placeholder="INV-0001"
      />
    ),
    icon: FileTextIcon,
    id: "details",
    isOpen: true,
    onNext: () => {},
    onToggle: () => {},
    title: "Document details",
  },
} satisfies Meta<typeof FormAccordionSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Document details" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "Next" }),
    ).toBeVisible();
  },
};

export const CollapsedComplete: Story = {
  args: { isComplete: true, isOpen: false },
};

export const LastSection: Story = {
  args: { isLast: true },
};
