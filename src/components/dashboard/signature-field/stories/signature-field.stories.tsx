import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { MAX_SIGNATURE_LENGTH } from "@/lib/sharing/signature-schema";

import { SignatureField } from "../signature-field";

const meta = {
  title: "Dashboard/Signature Field",
  component: SignatureField,
  tags: ["ai-generated"],
  args: { onChange: () => undefined, value: "" },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-white p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignatureField>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledField = (props: { disabled?: boolean }) => {
  const [value, setValue] = useState("");

  return (
    <SignatureField
      {...props}
      onChange={setValue}
      value={value}
    />
  );
};

/** Typing updates the field and is capped at the signature length limit. */
export const Typing: Story = {
  render: () => <ControlledField />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Type your full name to sign");
    await userEvent.type(input, "Sam Rivera");
    await expect(input).toHaveValue("Sam Rivera");
    await expect(input).toHaveAttribute(
      "maxlength",
      String(MAX_SIGNATURE_LENGTH),
    );
  },
};

/** Locked while the signature is being submitted. */
export const Disabled: Story = {
  args: { disabled: true, value: "Sam Rivera" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText("Type your full name to sign"),
    ).toBeDisabled();
  },
};
