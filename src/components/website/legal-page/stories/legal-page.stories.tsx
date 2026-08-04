import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { LegalPage } from "../legal-page";

const meta = {
  title: "Website/Legal Page",
  component: LegalPage,
  parameters: { layout: "fullscreen" },
  args: {
    description: "This policy explains how Dokiments handles information and user choices.",
    sections: [
      {
        title: "Information we use",
        paragraphs: ["We use information needed to provide and secure the Dokiments service."],
        bullets: ["Account information", "Documents you choose to create"],
      },
      {
        title: "Contact",
        paragraphs: ["Questions can be sent to privacy@dokiments.com."],
      },
    ],
    title: "Privacy Policy",
    updatedAt: "22 June 2026",
  },
} satisfies Meta<typeof LegalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    const legalLinks = within(canvas.getByRole("navigation", { name: "Legal links" }));
    await expect(legalLinks.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute(
      "href",
      "/cookies",
    );
  },
};
