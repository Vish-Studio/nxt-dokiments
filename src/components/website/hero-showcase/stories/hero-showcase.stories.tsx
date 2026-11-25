import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { HeroShowcase } from "../hero-showcase";

const meta = {
  title: "Website/Hero Showcase",
  component: HeroShowcase,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-6">
        <div className="grid overflow-hidden rounded-box bg-white text-nox-noir lg:grid-cols-[0.88fr_1.12fr]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof HeroShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop: the steps on the left, the workspace photo on the right. */
export const Desktop: Story = {
  play: async ({ canvas }) => {
    const photo = canvas.getByAltText(
      "Dokiments workspace displayed on a laptop",
    );
    // The test frame is short, so check the desktop layout is the one shown
    // rather than that the photo has a visible size.
    await expect(getComputedStyle(photo.parentElement!).display).not.toBe(
      "none",
    );
    await expect(
      getComputedStyle(
        canvas.getByAltText(/marketplace on a laptop/).parentElement!,
      ).display,
    ).toBe("none");
  },
};

/** Phones: picking a step switches the device scene under the intro card. */
export const FollowsTheSteps: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByAltText(/marketplace on a laptop/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /Add your client/ }),
    );
    await waitFor(async () => {
      await expect(canvas.getByAltText(/on two phones/)).toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole("button", { name: /Send the PDF/ }));
    await waitFor(async () => {
      await expect(
        canvas.getByAltText(/ready to download on a phone/),
      ).toBeInTheDocument();
    });
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
