import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

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
        menuClassName="mt-3 w-48"
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

/**
 * With `sheetTitle`, phones get the menu in a bottom sheet instead of the
 * anchored popover; choosing an option still closes it.
 */
export const PhoneSheet: Story = {
  args: {
    ariaLabel: "Sort",
    children: null,
    groups: [
      {
        label: "Sort by",
        onChange: fn(),
        options: [
          { label: "Recently added", value: "recent" },
          { label: "Name", value: "name" },
        ],
        value: "recent",
      },
    ],
    sheetTitle: "Sort",
    trigger: "Sort",
  },
  beforeEach: mockPhoneViewport,
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Sort" }));
    const sheet = await page.findByRole("dialog", { name: "Sort" });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(within(sheet).getByRole("menuitemradio", { name: "Name" }));
    await expect(args.groups?.[0]?.onChange).toHaveBeenCalledWith("name");
    await expect(page.queryByRole("dialog", { name: "Sort" })).toBeNull();
  },
};

/** The same `sheetTitle` menu on desktop keeps the anchored popover: no modal. */
export const SheetTitleOnDesktop: Story = {
  args: PhoneSheet.args,
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Sort" }));
    await expect(page.queryByRole("dialog", { name: "Sort" })).toBeNull();
    await userEvent.click(
      within(canvasElement).getByRole("menuitemradio", { name: "Name" }),
    );
    await expect(args.groups?.[0]?.onChange).toHaveBeenCalledWith("name");
  },
};
