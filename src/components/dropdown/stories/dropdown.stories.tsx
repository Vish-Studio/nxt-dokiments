import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Dropdown } from "../dropdown";

const meta = {
  component: Dropdown,
  tags: ["ai-generated"],
  args: {
    ariaLabel: "Example menu",
    trigger: "Open menu",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: "Example menu",
    trigger: "Open menu",
    children: null,
  },
  render: (args) => (
    <div className="grid justify-items-center gap-6">
      <Dropdown
        {...args}
        buttonClassName="btn rounded-box bg-base-200 text-nox-noir"
        menuClassName="mt-3 w-48 rounded-box bg-base-100 p-2 shadow-soft"
      >
        <ul className="menu p-0">
          <li>
            <a>Profile</a>
          </li>
          <li>
            <a>Settings</a>
          </li>
        </ul>
      </Dropdown>
      <button className="btn btn-ghost" type="button">
        Outside target
      </button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /example menu/i });
    await userEvent.click(trigger);
    await expect(await canvas.findByText("Profile")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /outside target/i }));
    await expect(canvas.queryByText("Profile")).not.toBeInTheDocument();
  },
};
