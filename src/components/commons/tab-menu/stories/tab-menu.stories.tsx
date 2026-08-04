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
