import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { ClientForm } from "../client-form";

const meta = {
  title: "Dashboard/Client Form",
  component: ClientForm,
  args: { formId: "client-form-story", onAdd: fn() },
} satisfies Meta<typeof ClientForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <ClientForm {...args} />
      <Button form={args.formId} type="submit">Add client</Button>
    </>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Client name"), "Maya Chen");
    await userEvent.type(canvas.getByLabelText("Company"), "Northline Studio");
    await userEvent.type(canvas.getByLabelText("Email"), "maya@northline.com");
    await userEvent.type(canvas.getByLabelText("Phone number"), "+230 5 123 4567");
    await userEvent.click(canvas.getByRole("button", { name: "Add client" }));
    await expect(args.onAdd).toHaveBeenCalledWith({
      brn: "",
      companyName: "Northline Studio",
      email: "maya@northline.com",
      name: "Maya Chen",
      nationalId: "",
      phone: "+230 5 123 4567",
    });
  },
};
