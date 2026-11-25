import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { DocumentListItem } from "../document-list-item";

const document = {
  createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
  id: "doc-story-1",
  name: "June Retainer Invoice",
  templateId: "classic-invoice",
  templateSnapshot: {
    description: "",
    documentType: "contract" as const,
    fields: [
      {
        key: "recipientSignature",
        label: "Recipient signature",
        type: "text" as const,
      },
    ],
    name: "Contract",
    style: {
      description: "",
      id: "classic" as const,
      name: "Classic",
      tier: "free" as const,
    },
  },
  updatedAt: new Date("2026-06-18T09:30:00Z").getTime(),
  values: { title: "Lumina Events Invoice" },
};

const documentTitle = document.values.title;

const meta = {
  title: "Dashboard/Document List Item",
  component: DocumentListItem,
  decorators: [
    (Story) => (
      <ol className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <Story />
      </ol>
    ),
  ],
  args: {
    document,
    onEdit: fn(),
    onPreview: fn(),
    onPrint: fn(),
  },
} satisfies Meta<typeof DocumentListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onDelete: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText(documentTitle)).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: `Open preview for ${documentTitle}` }),
    );
    await expect(args.onPreview).toHaveBeenCalledOnce();

    // The row itself has only Download PDF and the ⋮ menu.
    await expect(canvas.queryByRole("button", { name: `Edit ${documentTitle}` })).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: `Download PDF of ${documentTitle}` }),
    );
    await expect(args.onPrint).toHaveBeenCalledOnce();

    // Every action is in the menu, Delete last.
    const openMenu = () =>
      userEvent.click(
        canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
      );
    await openMenu();
    await userEvent.click(await page.findByRole("button", { name: "Edit" }));
    await expect(args.onEdit).toHaveBeenCalledOnce();
    await openMenu();
    await userEvent.click(await page.findByRole("button", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledWith(document);
  },
};

/**
 * The overview a user scans for: client under the title, then type, amount,
 * status and the dd/mm/yy date. No template style.
 */
export const KeyDetails: Story = {
  args: {
    document: {
      ...document,
      values: {
        title: "Lumina Events Invoice",
        toName: "Lumina Events",
        total: "4800",
      },
    },
    status: "awaiting",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Lumina Events")).toBeVisible();
    await expect(canvas.getByText("4,800.00")).toBeVisible();
    await expect(canvas.getByText("Awaiting signature")).toBeVisible();
    await expect(canvas.getByText("Contract")).toBeVisible();
    await expect(canvas.queryByText("Classic")).toBeNull();
  },
};

export const KeyDetailsPhone: Story = {
  ...KeyDetails,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4,800.00")).toBeVisible();
    await expect(canvas.getByText("Awaiting signature")).toBeVisible();
  },
};

/** A CV names its person and job title instead of a client. */
export const Cv: Story = {
  args: {
    document: {
      ...document,
      templateSnapshot: { ...document.templateSnapshot, documentType: "cv" as const },
      values: {
        fullName: "Maya Chen",
        jobTitle: "Product Designer",
        title: "Product designer CV",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Maya Chen · Product Designer")).toBeVisible();
    await expect(canvas.getByText("CV")).toBeVisible();
    await expect(canvas.queryByText("No client yet")).toBeNull();
  },
};

export const WithShare: Story = {
  args: { onShare: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledWith(document);
  },
};

/** A shared document also offers its shared copy, for watching the signature. */
export const WithViewShared: Story = {
  args: { onShare: fn(), onViewShared: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "View shared copy" }),
    );
    await expect(args.onViewShared).toHaveBeenCalledWith(document);
  },
};

/** Duplicate is offered for every document, without needing sharing to be on. */
export const WithDuplicate: Story = {
  args: { onDuplicate: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Duplicate" }));
    await expect(args.onDuplicate).toHaveBeenCalledWith(document);
    await expect(canvas.queryByRole("button", { name: "Share" })).toBeNull();
  },
};

/** A legacy document with no template snapshot can't be opened, so it can't be copied. */
export const DuplicateHiddenWithoutSnapshot: Story = {
  args: {
    document: { ...document, templateSnapshot: undefined },
    onDuplicate: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Duplicate" })).toBeNull();
  },
};

/** On phones the overflow menu opens in a bottom sheet titled with the document. */
export const MenuOnPhone: Story = {
  args: { onShare: fn() },
  beforeEach: mockPhoneViewport,
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    const sheet = await page.findByRole("dialog", { name: documentTitle });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(within(sheet).getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledWith(document);
    await expect(page.queryByRole("dialog", { name: documentTitle })).toBeNull();
  },
};

export const WithoutShare: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await expect(canvas.getByRole("button", { name: "Download PDF" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Share" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Delete" })).toBeNull();
  },
};

/**
 * Phones: no Print / Edit buttons on the row. The vertical ⋮ opens a bottom
 * sheet with Edit and Download PDF first, even when nothing else is on offer.
 */
export const ActionsSheetOnPhone: Story = {
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    // The trigger wrapper is CSS-hidden at the runner's desktop width.
    await userEvent.click(
      page.getByRole("button", {
        hidden: true,
        name: `More actions for ${documentTitle}`,
      }),
    );
    const sheet = await page.findByRole("dialog", { name: documentTitle });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(
      within(sheet).getByRole("button", { hidden: true, name: "Download PDF" }),
    );
    await expect(args.onPrint).toHaveBeenCalledWith(document);
  },
};
