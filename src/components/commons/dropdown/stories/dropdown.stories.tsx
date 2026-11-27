import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CopyIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { DropdownMenuItem } from "@/components/commons/dropdown-menu-item/dropdown-menu-item";
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

/**
 * An action menu (`children`): a `menu` of `DropdownMenuItem`s. Clicking the
 * trigger opens it on the first item and clicking outside closes it.
 */
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
        <DropdownMenuItem
          icon={PencilSimpleIcon}
          onClick={fn()}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          icon={CopyIcon}
          onClick={fn()}
        >
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={DownloadSimpleIcon}
          onClick={fn()}
        >
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={TrashIcon}
          onClick={fn()}
          tone="danger"
        >
          Delete
        </DropdownMenuItem>
      </Dropdown>
      <button
        className="btn btn-ghost"
        type="button"
      >
        Outside target
      </button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /example menu/i });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu", { name: "Example menu" });
    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(4);
    await expect(
      within(menu).getByRole("menuitem", { name: "Rename" }),
    ).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("button", { name: /outside target/i }),
    );
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
  },
};

/**
 * The action menu from the keyboard: ArrowDown or Enter opens it on the first
 * item, ArrowUp on the last; the arrows (wrapping), Home and End move between
 * items and skip disabled ones; Escape and Shift+Tab close it on the trigger;
 * Tab leaves it.
 */
export const ActionMenuKeyboard: Story = {
  ...Default,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /example menu/i });
    const item = (name: string) =>
      within(canvas.getByRole("menu")).getByRole("menuitem", { name });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item("Rename")).toHaveFocus();
    // "Duplicate" is disabled, so ArrowDown skips it.
    await userEvent.keyboard("{ArrowDown}");
    await expect(item("Download")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(item("Delete")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item("Rename")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(item("Delete")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(item("Rename")).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    await expect(item("Delete")).toHaveFocus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(item("Rename")).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /outside target/i }),
    ).toHaveFocus();
  },
};

/**
 * `popupRole="dialog"` for content that isn't a list of actions, like the
 * notification feed: the trigger says it opens a dialog and focus stays on it.
 */
export const DialogPopup: Story = {
  args: {
    ariaLabel: "Notifications",
    children: (
      <div className="grid gap-2 p-2">
        <p className="text-sm">Two new notifications</p>
        <button
          className="btn btn-sm"
          type="button"
        >
          Mark all as read
        </button>
      </div>
    ),
    menuClassName: "w-64",
    popupRole: "dialog",
    trigger: "Notifications",
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Notifications" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("dialog", { name: "Notifications" }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const SelectionMenu: Story = {
  args: {
    ariaLabel: "Sort items",
    trigger: "Sort",
    groups: [
      {
        label: "Sort by",
        value: "newest",
        options: [
          { label: "Newest first", value: "newest" },
          { label: "Oldest first", value: "oldest" },
        ],
        onChange: fn(),
      },
    ],
    menuClassName: "w-64",
  },
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole("button", { name: "Sort items" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("menuitemradio", { name: "Newest first" }),
    ).toHaveFocus();
    await userEvent.keyboard("{End}{Enter}");
    await expect(args.groups?.[0].onChange).toHaveBeenCalledWith("oldest");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(
      canvas.getByRole("menuitemradio", { name: "Oldest first" }),
    ).toHaveFocus();
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
    await userEvent.click(
      within(sheet).getByRole("menuitemradio", { name: "Name" }),
    );
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

/**
 * An action menu in the phone sheet: still a `menu`, opened on its first item,
 * with every item a 44px touch target.
 */
export const ActionMenuPhoneSheet: Story = {
  ...Default,
  args: { ...Default.args, sheetTitle: "Example menu" },
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Example menu" }));
    const sheet = await page.findByRole("dialog", { name: "Example menu" });
    const menu = within(sheet).getByRole("menu", { name: "Example menu" });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items[0]).toHaveFocus();
    for (const item of items) {
      await expect(item.getBoundingClientRect().height).toBe(44);
    }
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[2]).toHaveFocus();
  },
};
