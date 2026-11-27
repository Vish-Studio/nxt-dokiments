import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";

import { DocumentActionItems } from "../document-action-items";

const template = getTemplateById("classic-invoice") as MarketplaceTemplate;

const document: UserDocument = {
  createdAt: new Date("2026-06-18T09:30:00").getTime(),
  id: "doc-1",
  name: "June retainer invoice",
  templateId: template.id,
  templateSnapshot: {
    description: template.description,
    documentType: template.documentType,
    fields: template.fields,
    name: template.name,
    style: template.style,
  },
  updatedAt: new Date("2026-06-18T09:30:00").getTime(),
  values: { title: "June retainer invoice" },
};

const meta = {
  title: "Dashboard/Document Action Items",
  component: DocumentActionItems,
  args: { document, onDownload: fn(), onEdit: fn() },
  // The items are `menuitem`s, so they sit in a menu, as in a row's ⋮ Dropdown.
  // A story that renders its own Dropdown sets `parameters.menuWrapper: false`.
  decorators: [
    (Story, { parameters }) =>
      parameters.menuWrapper === false ? (
        <Story />
      ) : (
        <div
          aria-label="Document actions"
          className="w-52 rounded-box border border-steel-mist bg-base-100 p-1"
          role="menu"
        >
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof DocumentActionItems>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Only the required actions: Edit and Download PDF. */
export const Minimal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("menuitem").map((b) => b.textContent),
    ).toEqual(["Edit", "Download PDF"]);
  },
};

/** Every action, in order, with Delete last and in red. */
export const AllActions: Story = {
  args: {
    onDelete: fn(),
    onDuplicate: fn(),
    onShare: fn(),
    onViewShared: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("menuitem").map((b) => b.textContent),
    ).toEqual([
      "Edit",
      "Download PDF",
      "Duplicate",
      "Share",
      "View shared copy",
      "Delete",
    ]);
    await userEvent.click(canvas.getByRole("menuitem", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledWith(document);
    // The divider before Delete is a separator, not a focus stop.
    await expect(canvas.getByRole("separator")).not.toHaveAttribute("tabindex");
  },
};

/**
 * In a real ⋮ `Dropdown` the arrow keys walk every action in order and wrap,
 * stepping over the divider, and Enter runs the focused one.
 */
export const InDropdownKeyboard: Story = {
  args: AllActions.args,
  decorators: [
    (Story) => (
      <Dropdown
        ariaLabel="More actions for June retainer invoice"
        iconTrigger={
          <DotsThreeVerticalIcon
            aria-hidden
            size={20}
            weight="bold"
          />
        }
        menuClassName="w-52"
      >
        <Story />
      </Dropdown>
    ),
  ],
  parameters: { layout: "centered", menuWrapper: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "More actions for June retainer invoice",
    });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const items = within(canvas.getByRole("menu")).getAllByRole("menuitem");
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(items[5]).toHaveTextContent("Delete");
    await expect(items[5]).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(items[4]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onDownload).toHaveBeenCalledWith(document);
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
};
