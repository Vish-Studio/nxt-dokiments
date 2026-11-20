import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "@/components/commons/badge/badge";

import { TabMenu } from "../tab-menu";
import type { TabMenuProps } from "../tab-menu";

const items = [
  {
    badge: <Badge variant="free">Free</Badge>,
    id: "classic",
    label: "Classic",
  },
  {
    badge: <Badge variant="silver">Silver</Badge>,
    id: "modern",
    label: "Modern",
  },
  {
    badge: <Badge variant="gold">Gold</Badge>,
    id: "minimalist",
    label: "Minimalist",
  },
];

const TabMenuStory = (args: Omit<TabMenuProps, "onChange" | "value">) => {
  const [activeTab, setActiveTab] = useState("classic");

  return <TabMenu {...args} onChange={setActiveTab} value={activeTab} />;
};

const meta = {
  title: "Commons/Tab Menu",
  component: TabMenu,
  tags: ["ai-generated"],
  args: {
    ariaLabel: "Template styles",
    items,
    onChange: () => undefined,
    value: "classic",
  },
  render: (args) => <TabMenuStory {...args} />,
} satisfies Meta<typeof TabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const modernTab = canvas.getByRole("tab", { name: /modern/i });

    await userEvent.click(modernTab);
    await expect(modernTab).toHaveAttribute("aria-selected", "true");
  },
};

/**
 * `fitOnPhones`: on a phone every tab gets an equal column with the icon above
 * a short label, so none scrolls out of view. Tabs keep their full accessible
 * name ("Shared with me") even when the visible label is short.
 */
export const FitOnPhones: Story = {
  args: {
    ariaLabel: "Document lists",
    fitOnPhones: true,
    items: [
      { icon: <span aria-hidden>▦</span>, id: "classic", label: "Companies" },
      { icon: <span aria-hidden>☰</span>, id: "modern", label: "My documents" },
      { icon: <span aria-hidden>☺</span>, id: "minimalist", label: "Shared with me" },
      { badge: <span className="text-xs opacity-70">2</span>, icon: <span aria-hidden>▤</span>, id: "cvs", label: "CVs" },
    ],
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shared = canvas.getByRole("tab", { name: "Shared with me" });
    await userEvent.click(shared);
    await expect(shared).toHaveAttribute("aria-selected", "true");
  },
};
