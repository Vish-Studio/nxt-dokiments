import { AddressBook } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClientsShowcasePoint } from "../clients-showcase-point";

const meta = {
  title: "Website/Clients Showcase Point",
  component: ClientsShowcasePoint,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <ul className="max-w-md bg-base-200 p-6">
        <Story />
      </ul>
    ),
  ],
  args: {
    accent: "bg-play-blue",
    description:
      "Keep each client's name, phone, email, address, and BRN in My Clients, ready for the next document.",
    icon: AddressBook,
    title: "Save a client once",
  },
} satisfies Meta<typeof ClientsShowcasePoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
