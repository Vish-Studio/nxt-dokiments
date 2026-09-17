import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
