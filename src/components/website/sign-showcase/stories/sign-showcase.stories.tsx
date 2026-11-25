import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignShowcase } from "../sign-showcase";

const meta = {
  title: "Website/Sign Showcase",
  component: SignShowcase,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SignShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 2,
        name: "Send it. Get it signed.",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: /Create a free account/ }),
    ).toHaveAttribute("href", "/sign-up");
    // The copy matches how sharing works: recipients sign in to sign.
    await expect(canvas.getByText(/sign in to sign/)).toBeInTheDocument();
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
