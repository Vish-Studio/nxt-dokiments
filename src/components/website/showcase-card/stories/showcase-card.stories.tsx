import { Receipt } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ShowcaseDocument } from "@/components/website/showcase-document/showcase-document";

import { ShowcaseCard } from "../showcase-card";

const meta = {
  title: "Website/Showcase Card",
  component: ShowcaseCard,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-teal",
    description:
      "Turn quotes, proposals, and invoices around faster without leaving details scattered across files.",
    href: "/marketplace",
    icon: Receipt,
    linkLabel: "Browse templates",
    tag: "Invoices + quotes",
    title: "Freelancers",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShowcaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Freelancers")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: /browse templates/i }),
    ).toHaveAttribute("href", "/marketplace");
  },
};

export const WithoutTag: Story = {
  args: { tag: undefined },
};

/** A real document in the tile instead of the icon; decorative and inert. */
export const WithDocument: Story = {
  args: {
    visual: (
      <ShowcaseDocument
        className="absolute left-1/2 top-[12%] w-3/5 -translate-x-1/2 -rotate-3"
        templateId="classic-quotation"
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const tile = canvasElement.querySelector("[inert]");
    await expect(tile).toHaveAttribute("aria-hidden", "true");
    await expect(tile?.querySelector(".showcase-document")).not.toBeNull();
  },
};
