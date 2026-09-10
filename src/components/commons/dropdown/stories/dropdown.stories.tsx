import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";

import { Dropdown } from "../dropdown";

const meta = {
  title: "Commons/Dropdown",
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

export const SelectionMenu: Story = {
  args: {
    ariaLabel: "Sort items",
    trigger: "Sort",
    groups: [{ label: "Sort by", value: "newest", options: [{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }], onChange: fn() }],
    menuClassName: "w-64",
  },
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole("button", { name: "Sort items" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitemradio", { name: "Newest first" })).toHaveFocus();
    await userEvent.keyboard("{End}{Enter}");
    await expect(args.groups?.[0].onChange).toHaveBeenCalledWith("oldest");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("menuitemradio", { name: "Oldest first" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};
