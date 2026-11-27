import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

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

/**
 * Desktop: step 1 shows the workspace photo; picking step 2 cross-fades to its
 * own scene in the desktop layout.
 */
export const Desktop: Story = {
  play: async ({ canvas, canvasElement }) => {
    const desktop = canvasElement.querySelector<HTMLElement>(
      ".hero-product-mockup-desktop",
    )!;
    const phone = canvasElement.querySelector<HTMLElement>(
      ".hero-product-mockup-phone",
    )!;
    // The test frame is short, so check which layout is shown rather than
    // that the photo has a visible size.
    await expect(getComputedStyle(desktop).display).not.toBe("none");
    await expect(getComputedStyle(phone).display).toBe("none");
    await expect(
      within(desktop).getByAltText("Dokiments workspace displayed on a laptop"),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /Add your client/ }),
    );
    await waitFor(async () => {
      await expect(
        within(desktop).getByAltText(/on two phones/),
      ).toBeInTheDocument();
    });
  },
};

/** Phones: picking a step switches the device scene under the intro card. */
export const FollowsTheSteps: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    const phone = within(
      canvasElement.querySelector<HTMLElement>(".hero-product-mockup-phone")!,
    );
    await expect(
      phone.getByAltText(/marketplace on a laptop/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /Add your client/ }),
    );
    await waitFor(async () => {
      await expect(phone.getByAltText(/on two phones/)).toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole("button", { name: /Send the PDF/ }));
    await waitFor(async () => {
      await expect(
        phone.getByAltText(/ready to download on a phone/),
      ).toBeInTheDocument();
    });
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
