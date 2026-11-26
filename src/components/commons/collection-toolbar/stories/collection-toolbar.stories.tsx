import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";
import CollectionToolbar from "../collection-toolbar";

const meta = {
  title: "Commons/Collection Toolbar",
  component: CollectionToolbar,
  parameters: { layout: "padded" },
  args: {
    ariaLabel: "Find documents", searchLabel: "Search documents", search: "", onSearch: fn(),
    sort: "newest", sortOptions: [{ label: "Newest", value: "newest" }, { label: "Oldest", value: "oldest" }], onSort: fn(),
    filters: [{ id: "status", label: "Status", value: "all", defaultValue: "all", options: [{ label: "All statuses", value: "all" }, { label: "Draft", value: "draft" }], onChange: fn() }],
    resultLabel: "12 documents", onReset: fn(),
  },
} satisfies Meta<typeof CollectionToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("menu", { name: "Filters" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Draft" }));
    await expect(args.filters?.[0].onChange).toHaveBeenCalledWith("draft");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("menu", { name: "Filters" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Sort" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Oldest" }));
    await expect(args.onSort).toHaveBeenCalledWith("oldest");
  },
};
export const SearchOnly: Story = { args: { filters: [] } };

export const SearchClearControl: Story = {
  args: { search: "invoice" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search documents" });

    await expect(search).toHaveAttribute("type", "text");
    await expect(canvas.getByRole("button", { name: "Clear search" })).toBeVisible();
  },
};

export const ActiveFilters: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(args.onSearch).toHaveBeenCalledWith("");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Status filter" }));
    await expect(args.filters?.[0].onChange).toHaveBeenCalledWith("all");
  },
  args: {
    search: "contract",
    canReset: true,
    resultLabel: "3 documents",
    filters: [{ ...meta.args.filters[0], value: "draft" }],
  },
};

/** On phones Sort opens in a bottom sheet and closes as soon as an order is picked. */
export const SortOnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Sort" }));
    const sheet = await page.findByRole("dialog", { name: "Sort" });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(within(sheet).getByRole("menuitemradio", { name: "Oldest" }));
    await expect(args.onSort).toHaveBeenCalledWith("oldest");
    await expect(page.queryByRole("dialog", { name: "Sort" })).toBeNull();
  },
};

/** Filters stay open on phones so several can be picked; "Done" closes the sheet. */
export const FiltersOnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Filters" }));
    const sheet = await page.findByRole("dialog", { name: "Filters" });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(within(sheet).getByRole("menuitemradio", { name: "Draft" }));
    await expect(args.filters?.[0].onChange).toHaveBeenCalledWith("draft");
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: "Done" }));
    await expect(page.queryByRole("dialog", { name: "Filters" })).toBeNull();
  },
};

const chipFilters = [
  { id: "status", label: "Status", value: "signed", defaultValue: "all", options: [{ label: "Any status", value: "all" }, { label: "Signed", value: "signed" }], onChange: fn() },
  { id: "type", label: "Type", value: "all", defaultValue: "all", options: [{ label: "Any type", value: "all" }, { label: "Invoice", value: "invoice" }], onChange: fn() },
];

/**
 * Chips on desktop; on phones they fold into one filter icon (with a dot when
 * a filter is set) between search and sort, so the row never wraps.
 */
export const ChipsCollapseOnPhone: Story = {
  args: { filterStyle: "chips", filters: chipFilters },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { hidden: true, name: "Filters (1 active)" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole("button", { hidden: true, name: "Status: Signed" }),
    ).toHaveLength(1);
  },
};

/** A tab the toolbar doesn't apply to: every control stays, disabled. */
export const Disabled: Story = {
  args: { canReset: true, disabled: true, filterStyle: "chips", filters: chipFilters, search: "nda" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("searchbox", { name: "Search documents" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Sort" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Status: Signed" })).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await expect(canvas.queryAllByRole("button", { name: "Reset filters" })).toHaveLength(0);
  },
};

/** Phones: "Clear filters" sits before "Done" in the Filters sheet, not in the header. */
export const ClearFiltersInPhoneSheet: Story = {
  args: { canReset: true, filterStyle: "chips", filters: chipFilters },
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("button", { hidden: true, name: "Filters (1 active)" }),
    );
    const sheet = await page.findByRole("dialog", { name: "Filters" });
    // The sheet title leads with the filter icon; the name stays "Filters".
    const heading = within(sheet).getByRole("heading", { name: "Filters" });
    await expect(heading.querySelector("svg")).not.toBeNull();
    const clear = within(sheet).getByRole("button", { name: "Clear filters" });
    const done = within(sheet).getByRole("button", { name: "Done" });
    // Clear comes first, Done last.
    await expect(
      clear.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await userEvent.click(clear);
    await expect(args.onReset).toHaveBeenCalledOnce();
  },
};
