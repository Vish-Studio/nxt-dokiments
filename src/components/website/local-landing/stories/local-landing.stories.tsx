import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";
import { mauritiusPage } from "@/lib/website/local-pages";

import { LocalLanding } from "../local-landing";

const meta = {
  title: "Website/Local Landing",
  component: LocalLanding,
  parameters: { layout: "fullscreen" },
  args: { page: mauritiusPage },
} satisfies Meta<typeof LocalLanding>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `/invoice-maker-mauritius`: one `h1` with the search phrase, sign-up as the
 * main action, four reasons it fits, and the local FAQ.
 */
export const Mauritius: Story = {
  play: async ({ canvas }) => {
    const headings = canvas.getAllByRole("heading", { level: 1 });
    await expect(headings).toHaveLength(1);
    await expect(headings[0]).toHaveTextContent(
      "Free invoice maker for businesses in Mauritius",
    );
    await expect(
      canvas.getByRole("link", { name: /Create a free account/ }),
    ).toHaveAttribute("href", "/sign-up");
    await expect(canvas.getByText("Bill in rupees")).toBeInTheDocument();
    await expect(
      canvas.getByText("Can I make invoices in Mauritian rupees?"),
    ).toBeInTheDocument();
  },
};

export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
