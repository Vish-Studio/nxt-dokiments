import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
import type { Client } from "@/types/client";

import { ClientForm } from "../client-form";

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

/**
 * Overwrites a field that react-hook-form prefilled from `defaultValues`.
 *
 * `userEvent` can't edit these: react-hook-form seeds the input imperatively
 * through its `ref`, and the synthesized keystrokes that follow update the DOM
 * without React re-firing `onChange` — the field visibly shows the new text while
 * the submitted values stay stale. Verified against both `clear()` + `type()` and
 * `tripleClick()` + `keyboard()`. `fireEvent.change` goes through the native value
 * setter, which is the path a real browser keystroke takes, and does reach the form.
 */
const replaceValue = (field: HTMLElement, value: string) => {
  fireEvent.change(field, { target: { value } });
};

const meta = {
  title: "Dashboard/Client Form",
  component: ClientForm,
  args: { formId: "client-form-story", onSubmit: fn() },
  render: (args) => (
    <>
      <ClientForm
        {...args}
        key={args.client?.id ?? "new"}
      />
      <Button
        form={args.formId}
        type="submit"
      >
        {args.client ? "Save changes" : "Add client"}
      </Button>
    </>
  ),
} satisfies Meta<typeof ClientForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Client name"), "Maya Chen");
    await userEvent.type(canvas.getByLabelText("Company"), "Northline Studio");
    await userEvent.type(canvas.getByLabelText("Email"), "maya@northline.com");
    await userEvent.type(
      canvas.getByLabelText("Phone number"),
      "+230 5 123 4567",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add client" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      address: "",
      brn: "",
      companyName: "Northline Studio",
      email: "maya@northline.com",
      name: "Maya Chen",
      nationalId: "",
      phone: "+230 5 123 4567",
    });

    // Add mode clears itself, ready for the next client.
    await expect(canvas.getByLabelText("Client name")).toHaveValue("");
  },
};

/** Edit mode: every field is prefilled, and the form keeps its values after saving. */
export const EditExistingClient: Story = {
  args: { client: mayaChen },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Client name")).toHaveValue("Maya Chen");
    await expect(canvas.getByLabelText("National ID (optional)")).toHaveValue(
      "A1234567890123",
    );

    replaceValue(canvas.getByLabelText("Phone number"), "+230 5 000 1111");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(args.onSubmit).toHaveBeenCalledWith({
      address: "12 Rue La Bourdonnais, Port Louis",
      brn: "C12345678",
      companyName: "Northline Studio",
      email: "maya@northline.com",
      name: "Maya Chen",
      nationalId: "A1234567890123",
      phone: "+230 5 000 1111",
    });

    // Must NOT reset — the panel behind is still showing these values.
    await expect(canvas.getByLabelText("Client name")).toHaveValue("Maya Chen");
  },
};

export const ValidationErrors: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add client" }));
    await expect(canvas.getByText("Client name is required.")).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
