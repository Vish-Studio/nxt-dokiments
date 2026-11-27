import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { desktopMediaQuery } from "@/hooks/use-media-query";
import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplatePicker } from "../template-picker";

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

const templates = [
  "modern-invoice",
  "classic-invoice",
  "classic-quotation",
  "modern-contract",
].map((id) => getTemplateById(id)) as MarketplaceTemplate[];

/**
 * `beforeEach` that pins {@link desktopMediaQuery}, so a row click selects
 * (desktop) or starts the document (phone) whatever the runner's viewport.
 */
const pinDesktop = (matches: boolean) => () => {
  const realMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query: string) =>
    query === desktopMediaQuery
      ? ({
          addEventListener: () => {},
          addListener: () => {},
          dispatchEvent: () => false,
          matches,
          media: query,
          onchange: null,
          removeEventListener: () => {},
          removeListener: () => {},
        } satisfies MediaQueryList)
      : realMatchMedia(query);

  return () => {
    window.matchMedia = realMatchMedia;
  };
};

const meta = {
  title: "Dashboard/Template Picker",
  component: TemplatePicker,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-4 lg:p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    lastUsed: {
      "classic-invoice": now - 2 * day,
      "modern-invoice": now - 9 * day,
      "classic-quotation": now - 40 * day,
    },
    onPreview: fn(),
    onUse: fn(),
    templates,
  },
} satisfies Meta<typeof TemplatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop: a click selects a row for the preview pane; Enter or the button uses it. */
export const Desktop: Story = {
  beforeEach: pinDesktop(true),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // The card says what to do before anything is clicked.
    await expect(
      canvas.getByRole("heading", { name: "Choose a template" }),
    ).toBeVisible();
    await expect(
      canvas.getByText(
        "Next, fill in the details. Your own details are already added.",
      ),
    ).toBeVisible();

    // Grouped by type, most recently used first.
    const invoices = canvas.getByRole("region", { name: "Invoice templates" });
    const rows = within(invoices).getAllByRole("button");
    await expect(rows[0]).toHaveAccessibleName(/used 2 days ago/);
    await expect(rows[0]).toHaveAttribute("aria-current", "true");

    await userEvent.click(canvas.getByRole("button", { name: /^Quotation, / }));
    await expect(args.onUse).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole("region", { name: "Quotation preview" }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Preview full size" }),
    );
    await expect(args.onPreview).toHaveBeenCalledWith(
      expect.objectContaining({ id: "classic-quotation" }),
    );

    canvas.getByRole("button", { name: /^Quotation, / }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("button", { name: /^Contract, / }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onUse).toHaveBeenCalledWith(
      expect.objectContaining({ id: "modern-contract" }),
    );
  },
};

/** Phones: list only, and a tap starts the document straight away. */
export const Phone: Story = {
  beforeEach: pinDesktop(false),
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /^Quotation, / }));
    await expect(args.onUse).toHaveBeenCalledWith(
      expect.objectContaining({ id: "classic-quotation" }),
    );
  },
};

/** Started from a company page: a "For: …" chip that can drop the prefill. */
export const ForACompany: Story = {
  beforeEach: pinDesktop(true),
  args: {
    contextLabel: "Northline Studio",
    onClearContext: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        "Next, fill in the details. Your details and Northline Studio are already added.",
      ),
    ).toBeVisible();
    await expect(canvas.getAllByText("Northline Studio")[0]).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Don't prefill Northline Studio" }),
    );
    await expect(args.onClearContext).toHaveBeenCalled();
  },
};

/** Phones: the chip still drops the prefill; there is no preview footer. */
export const ForACompanyPhone: Story = {
  args: ForACompany.args,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Tap one to start your document."),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Don't prefill Northline Studio" }),
    );
    await expect(args.onClearContext).toHaveBeenCalled();
  },
  beforeEach: pinDesktop(false),
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};

/** Type chips and search narrow the list; no match offers "Clear filters". */
export const FilterAndSearch: Story = {
  beforeEach: pinDesktop(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Invoice" }));
    await expect(
      canvas.queryByRole("region", { name: "Quotation templates" }),
    ).not.toBeInTheDocument();

    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search your templates" }),
      "brutalist",
    );
    await expect(canvas.getByText("No templates match")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear filters" }),
    );
    await expect(
      canvas.getByRole("region", { name: "Quotation templates" }),
    ).toBeInTheDocument();
  },
};

/** One template type: the chip row is hidden, since it could only say "All". */
export const SingleType: Story = {
  beforeEach: pinDesktop(true),
  args: { templates: templates.slice(0, 2), lastUsed: {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole("group", { name: "Template type" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getAllByText(/not used yet/)).toHaveLength(2);
  },
};
