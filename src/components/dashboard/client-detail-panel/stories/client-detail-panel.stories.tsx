import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type { Client } from "@/types/client";

import { ClientDetailPanel } from "../client-detail-panel";

/**
 * Overwrites a field that react-hook-form prefilled from `defaultValues`.
 *
 * `userEvent` can't edit these: react-hook-form seeds the input imperatively
 * through its `ref`, and the synthesized keystrokes that follow update the DOM
 * without React re-firing `onChange`, so the form submits stale values.
 * `fireEvent.change` goes through the native value setter and does reach the form.
 */
const replaceValue = (field: HTMLElement, value: string) => {
  fireEvent.change(field, { target: { value } });
};

const mayaChen: Client = {
  address: "12 Rue La Bourdonnais, Port Louis",
  brn: "C12345678",
  companyName: "Northline Studio",
  createdAt: 1_755_000_000_000,
  email: "maya@northline.com",
  id: "client_abc_123456",
  name: "Maya Chen",
  nationalId: "A1234567890123",
  phone: "+230 5 123 4567",
  updatedAt: 1_755_000_000_000,
};

const meta = {
  title: "Dashboard/Client Detail Panel",
  component: ClientDetailPanel,
  parameters: { layout: "fullscreen" },
  args: {
    client: mayaChen,
    mode: "detail",
    onClose: fn(),
    onDelete: fn(),
    onEdit: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof ClientDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Detail: Story = {
  play: async ({ args, canvasElement }) => {
    // The panel renders in a portal-free fixed overlay, so query the whole body.
    const canvas = within(canvasElement.ownerDocument.body);

    // The point of the panel: fields that appear in no list column.
    await expect(canvas.getByText("A1234567890123")).toBeVisible();
    await expect(canvas.getByText("C12345678")).toBeVisible();
    await expect(
      canvas.getByText("12 Rue La Bourdonnais, Port Louis"),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Edit client" }));
    await expect(args.onEdit).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

/** Optional fields left blank read as "Not set" rather than silently empty. */
export const MissingOptionalFields: Story = {
  args: {
    client: { ...mayaChen, address: "", brn: "", nationalId: "" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getAllByText("Not set")).toHaveLength(3);
  },
};

/** Edit swaps the same panel's body to a prefilled form. */
export const Edit: Story = {
  args: { mode: "edit" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByLabelText("Client name")).toHaveValue("Maya Chen");
    await expect(canvas.getByLabelText("BRN (optional)")).toHaveValue(
      "C12345678",
    );

    replaceValue(canvas.getByLabelText("Phone number"), "+230 5 000 1111");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Maya Chen", phone: "+230 5 000 1111" }),
    );
  },
};

/**
 * Regression: "Save changes" renders on top of where "Edit client" just was, and
 * React reuses the same DOM button, so a second click on the same spot used to
 * submit the untouched form and bounce straight back to detail — indistinguishable
 * from "Edit client didn't work". Nothing is dirty on arrival, so it's inert.
 */
export const SecondClickDoesNotSave: Story = {
  args: { mode: "edit" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const save = canvas.getByRole("button", { name: "Save changes" });
    await expect(save).toBeDisabled();
    fireEvent.click(save);
    await expect(args.onSave).not.toHaveBeenCalled();

    // Editing anything arms it.
    replaceValue(canvas.getByLabelText("Phone number"), "+230 5 000 1111");
    await expect(
      canvas.getByRole("button", { name: "Save changes" }),
    ).toBeEnabled();
  },
};

/** Validation still applies in edit mode — clearing a required field blocks the save. */
export const EditValidation: Story = {
  args: { mode: "edit" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    replaceValue(canvas.getByLabelText("Client name"), "");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(canvas.getByText("Client name is required.")).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

export const Saving: Story = {
  args: { isSaving: true, mode: "edit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getByRole("button", { name: "Saving…" }),
    ).toBeDisabled();
  },
};

/** `client: null` is how the view closes the panel. */
export const Closed: Story = {
  args: { client: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
