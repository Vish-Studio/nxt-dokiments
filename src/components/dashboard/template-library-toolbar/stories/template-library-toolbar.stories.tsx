import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import TemplateLibraryToolbar from "../template-library-toolbar";

const meta = {
  title: "Dashboard/Template Library Toolbar",
  component: TemplateLibraryToolbar,
  parameters: { layout: "padded" },
  args: {
    search: "", documentType: "all", style: "all", sort: "newest",
    typeOptions: [{ value: "invoice", label: "Invoice" }],
    styleOptions: [{ value: "classic", label: "Classic" }],
    onSearch: fn(), onDocumentType: fn(), onStyle: fn(), onSort: fn(), onReset: fn(),
  },
} satisfies Meta<typeof TemplateLibraryToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filtered: Story = { args: { search: "invoice" } };
