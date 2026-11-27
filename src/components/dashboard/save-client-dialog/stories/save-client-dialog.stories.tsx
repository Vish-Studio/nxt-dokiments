import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { SaveClientDialog } from "../save-client-dialog";

const meta = {
  title: "Dashboard/Save Client Dialog",
  component: SaveClientDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    client: {
      address: "3 Royal Road, Rose Hill",
      email: "hello@northline.mu",
      name: "Northline Studio",
      phone: "+230 5 712 0044",
    },
    onSave: fn(),
    onSkip: fn(),
    open: true,
  },
} satisfies Meta<typeof SaveClientDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "Save this client?",
    });

    await expect(
      within(dialog).getByText(/Add Northline Studio to My Clients/),
    ).toBeVisible();
    await expect(
      within(dialog).getByText("3 Royal Road, Rose Hill"),
    ).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save client" }),
    );
    await expect(args.onSave).toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Not now" }),
    );
    await expect(args.onSkip).toHaveBeenCalled();
  },
};

/** Missing email and phone: it says what to add and offers only "Not now". */
export const MissingDetails: Story = {
  args: {
    client: { name: "Northline Studio" },
    missing: ["email", "phone"],
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "Save this client?",
    });

    await expect(
      within(dialog).getByText(/add an email and a phone number first/),
    ).toBeVisible();
    await expect(
      within(dialog).queryByRole("button", { name: "Save client" }),
    ).not.toBeInTheDocument();
  },
};

/** Phones: a bottom sheet, "Save client" on top. */
export const Phone: Story = {
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
