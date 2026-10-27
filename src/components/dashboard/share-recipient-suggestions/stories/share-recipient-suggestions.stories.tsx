import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ShareRecipientSuggestions } from "../share-recipient-suggestions";

const meta = {
  title: "Dashboard/Share Recipient Suggestions",
  component: ShareRecipientSuggestions,
  tags: ["ai-generated"],
  args: {
    onSelect: fn(),
    sections: [
      {
        items: [{ email: "sam@example.com" }, { email: "priya@example.com" }],
        label: "Recent",
      },
    ],
  },
} satisfies Meta<typeof ShareRecipientSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: /priya@example.com/ }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith("priya@example.com");
  },
};

export const Selected: Story = {
  args: { selected: " Sam@Example.com " },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: /sam@example.com/ }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const Empty: Story = {
  args: { sections: [{ items: [], label: "Recent" }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("Recent")).toBeNull();
  },
};

export const Sections: Story = {
  args: {
    sections: [
      {
        items: [{ email: "ada@acme.com" }],
        label: "Recipient on this document",
      },
      {
        items: [
          { email: "ada@acme.com", name: "Ada" },
          { email: "sam@example.com", name: "Sam" },
        ],
        label: "Your clients",
      },
      {
        items: [{ email: "sam@example.com" }, { email: "priya@example.com" }],
        label: "Recent",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An address shows once, under the first section that lists it.
    await expect(
      canvas.getAllByRole("button", { name: /ada@acme.com/ }),
    ).toHaveLength(1);
    await expect(
      canvas.getAllByRole("button", { name: /sam@example.com/ }),
    ).toHaveLength(1);
    await expect(canvas.getByText("Recipient on this document")).toBeVisible();
  },
};

export const MoreThanShown: Story = {
  args: {
    sections: [
      {
        items: Array.from({ length: 8 }, (_, index) => ({
          email: `client${index}@acme.com`,
          name: `Client ${index}`,
        })),
        label: "Your clients",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(5);
    await expect(canvas.getByText(/3 more/)).toBeVisible();
  },
};
