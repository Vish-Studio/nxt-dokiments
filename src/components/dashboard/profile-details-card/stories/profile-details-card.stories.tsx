import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { ProfileDetailsCard } from "../profile-details-card";

const meta = {
  title: "Dashboard/Profile Details Card",
  component: ProfileDetailsCard,
  parameters: { layout: "padded" },
  args: {
    description: "Your company name and address are filled into every new document.",
    fields: [
      {
        autoComplete: "organization",
        label: "Company name",
        name: "companyName",
        placeholder: "Your company",
        wide: true,
      },
      {
        autoComplete: "street-address",
        label: "Address",
        name: "address",
        placeholder: "Street, city, postal code",
        wide: true,
      },
    ],
    title: "Business details",
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          companyName: "Northline Studio",
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          provider: "password",
          role: "free",
          uid: "story-uid",
        },
      });
      return <Story />;
    },
  ],
} satisfies Meta<typeof ProfileDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Northline Studio")).toBeVisible();
    // The address was never set.
    await expect(canvas.getByText("Not set")).toBeVisible();
  },
};

export const Editing: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit business details" }),
    );
    await expect(canvas.getByLabelText("Company name")).toHaveValue(
      "Northline Studio",
    );
  },
};
