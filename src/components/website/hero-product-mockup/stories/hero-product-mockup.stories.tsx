import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { HeroProductMockup } from "../hero-product-mockup";

const meta = {
  title: "Website/Hero Product Mockup",
  component: HeroProductMockup,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroProductMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Desktop: the workspace photo, the dashboard on a laptop on a log, with the
 * app on an iPhone. The phone scenes are in the DOM but hidden at this width.
 */
export const Desktop: Story = {
  play: async ({ canvas, canvasElement }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByAltText("Dokiments workspace displayed on a laptop"),
      ).toBeVisible();
    });
    await expect(
      canvas.getByAltText("Dokiments dashboard displayed on a mobile phone"),
    ).toBeVisible();
    // Two desktop images plus the three phone scenes.
    await expect(canvasElement.querySelectorAll("img")).toHaveLength(5);
  },
};

/** Phone, step 1, "Pick a template": the marketplace on a laptop on a rock. */
export const Template: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByAltText(/marketplace on a laptop/),
      ).toBeInTheDocument();
    });
    // The other scenes stay mounted for a seamless swap, but are not announced.
    await expect(
      canvasElement.querySelectorAll('img[aria-hidden="true"]'),
    ).toHaveLength(2);
  },
};

/** Phone, step 2, "Add your client": the client book and a prefilled invoice on phones. */
export const Client: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: { activeStepId: "client" },
  play: async ({ canvas }) => {
    await expect(canvas.getByAltText(/on two phones/)).toBeInTheDocument();
  },
};

/** Phone, step 3, "Send the PDF": the finished invoice on a laptop and phone. */
export const Send: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: { activeStepId: "send" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByAltText(/ready to download on a phone/),
    ).toBeInTheDocument();
  },
};

/** Phones: a 4 : 3 frame under the intro card, following the steps. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
