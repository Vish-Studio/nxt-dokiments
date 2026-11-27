import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

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
 * Desktop, step 1: the workspace photo, the dashboard on a laptop on a log,
 * with the app on an iPhone. The phone scenes are in the DOM but hidden.
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
    // Desktop: the step 1 photo pair and the step 2 and 3 scenes; phones: three scenes.
    await expect(canvasElement.querySelectorAll("img")).toHaveLength(7);
  },
};

/**
 * Desktop, step 2 "Add your client": the client scene replaces the workspace
 * photo.
 */
export const DesktopClient: Story = {
  args: { activeStepId: "client" },
  play: async ({ canvasElement }) => {
    const visible = [...canvasElement.querySelectorAll("img")].filter(
      (img) => img.checkVisibility() && img.alt,
    );
    await expect(visible.map((img) => img.alt)).toEqual([
      expect.stringMatching(/on two phones/),
    ]);
  },
};

/** The phone layout's container, so phone stories query only its scenes. */
const phoneScenes = (canvasElement: HTMLElement) =>
  within(
    canvasElement.querySelector<HTMLElement>(".hero-product-mockup-phone")!,
  );

/** Phone, step 1, "Pick a template": the marketplace on a laptop on a rock. */
export const Template: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const phone = phoneScenes(canvasElement);
    await waitFor(async () => {
      await expect(
        phone.getByAltText(/marketplace on a laptop/),
      ).toBeInTheDocument();
    });
    // The other scenes stay mounted for a seamless swap, but are not announced.
    await expect(
      canvasElement.querySelectorAll(
        '.hero-product-mockup-phone img[aria-hidden="true"]',
      ),
    ).toHaveLength(2);
  },
};

/** Phone, step 2, "Add your client": the client book and a prefilled invoice on phones. */
export const Client: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: { activeStepId: "client" },
  play: async ({ canvasElement }) => {
    await expect(
      phoneScenes(canvasElement).getByAltText(/on two phones/),
    ).toBeInTheDocument();
  },
};

/** Phone, step 3, "Send the PDF": the finished invoice on a laptop and phone. */
export const Send: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: { activeStepId: "send" },
  play: async ({ canvasElement }) => {
    await expect(
      phoneScenes(canvasElement).getByAltText(/ready to download on a phone/),
    ).toBeInTheDocument();
  },
};

/** Phones: a 4 : 3 frame under the intro card, following the steps. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
