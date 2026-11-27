import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { companyStoryGroups } from "@/lib/storybook/company-document-fixtures";

import { CompanyDocumentGroups } from "../company-document-groups";
import { CompanyDocumentGroupsSkeleton } from "../company-document-groups-skeleton";

const meta = {
  title: "Dashboard/Company Document Groups",
  component: CompanyDocumentGroups,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    groups: companyStoryGroups,
    onDelete: fn(),
    onDownload: fn(),
    onDuplicate: fn(),
    onEdit: fn(),
    onOpenEntry: fn(),
    onShare: fn(),
  },
} satisfies Meta<typeof CompanyDocumentGroups>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One section per company; rows open the preview or the shared view. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = canvas.getByRole("region", { name: "Northline Studio" });
    await expect(
      within(northline).getByRole("list", {
        name: "Documents for Northline Studio",
      }),
    ).toBeVisible();

    await userEvent.click(
      within(northline).getByRole("button", {
        name: "Preview June retainer invoice",
      }),
    );
    await expect(args.onOpenEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc:nl-1" }),
    );
    // Received documents open the shared view instead.
    await expect(
      within(northline).getByRole("button", { name: "Open Mutual NDA" }),
    ).toBeVisible();

    // Amounts show at a glance: typed currency kept, plain numbers formatted.
    // Desktop rows show the amount; phones keep the ⋮ menu instead.
    await expect(
      within(northline)
        .getAllByText("1,250.00")
        .some((element) => element.checkVisibility()),
    ).toBe(true);

    // The vertical menu has the same actions as the My documents rows.
    await userEvent.click(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("menuitem", { name: "Download PDF" }),
    );
    await expect(args.onDownload).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );
    await userEvent.click(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    );
    await userEvent.click(await body.findByRole("menuitem", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );
    await userEvent.click(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    );
    for (const action of ["Edit", "Download PDF", "Duplicate", "Share"]) {
      await expect(
        await body.findByRole("menuitem", { name: action }),
      ).toBeInTheDocument();
    }
    await userEvent.click(body.getByRole("menuitem", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );

    // No "+" for documents without a client.
    const noClient = canvas.getByRole("region", { name: "No client yet" });
    await expect(
      within(noClient).queryByRole("link", { name: /^New document/ }),
    ).toBeNull();
  },
};

/**
 * A row's ⋮ menu works from the keyboard: it is a `menu` of `menuitem`s,
 * ArrowDown opens it on the first item, the arrows, Home and End move between
 * actions, and Escape closes it back on the trigger.
 */
export const RowMenuKeyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = canvas.getByRole("region", { name: "Northline Studio" });
    const trigger = within(northline).getByRole("button", {
      name: "More actions for June retainer invoice",
    });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = canvas.getByRole("menu", {
      name: "More actions for June retainer invoice",
    });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((item) => item.textContent)).toEqual([
      "Edit",
      "Download PDF",
      "Duplicate",
      "Share",
      "Delete",
    ]);
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(items[4]).toHaveFocus();
    await userEvent.keyboard("{Home}{ArrowUp}");
    await expect(items[4]).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("menu")).toBeNull();
    await expect(trigger).toHaveFocus();

    // Enter opens it too, and activating an item runs the action.
    await userEvent.keyboard("{Enter}");
    await expect(
      within(canvas.getByRole("menu")).getByRole("menuitem", { name: "Edit" }),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onDownload).toHaveBeenCalledWith(
      expect.objectContaining({ id: "nl-1" }),
    );
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
};

/**
 * The card header: the name links to the company page, and the summary of how
 * many documents and what needs attention sits at its right end (no "+":
 * new documents start from the toolbar or the company page). Desktop rows show who it was shared with in its own column, and
 * what happened and when under the status pill.
 */
export const HeaderAndActivity: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = canvas.getByRole("region", { name: "Northline Studio" });

    await expect(
      within(northline).getByRole("link", {
        name: "View company Northline Studio",
      }),
    ).toBeVisible();
    await expect(
      within(northline).queryByRole("link", { name: /^New document for/ }),
    ).toBeNull();
    // From `sm` the summary is the header's last item, right-aligned.
    const header = northline.querySelector("header") as HTMLElement;
    const summary = header.lastElementChild as HTMLElement;
    await expect(summary).toBeVisible();
    await expect(summary).toHaveTextContent(/^\d+ documents?( · |$)/);
    await expect(summary).toHaveClass("text-right");
    // Who it was exchanged with has its own column (lg+), so the line under
    // the status pill only says what happened and when.
    await expect(
      within(northline).getByText("accounts@northline.com"),
    ).toBeInTheDocument();
    await expect(
      within(northline).getByText("From Alex Morgan"),
    ).toBeInTheDocument();
    await expect(
      within(northline).getAllByText(
        /^(Signed \d|Not sent yet|Shared with you)/,
      ).length,
    ).toBeGreaterThan(0);
  },
};

/**
 * Phones: the header shows only the company name (no avatar) over the
 * summary, with the caret at the right end; rows are slim (status dot, title over status word)
 * with the ⋮ menu.
 */
export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = canvas.getByRole("region", { name: "Northline Studio" });
    const header = northline.querySelector("header") as HTMLElement;

    // No avatar or placeholder icon is visible in the phone header.
    const visibleCircles = [...header.querySelectorAll(".rounded-full")].filter(
      (element) => element.checkVisibility(),
    );
    await expect(visibleCircles).toHaveLength(0);
    await expect(
      within(header).getByRole("button", {
        name: "Hide documents for Northline Studio",
      }),
    ).toBeVisible();
    await expect(
      within(header).queryByRole("link", { name: /^New document for/ }),
    ).toBeNull();
    // The summary stays under the name on phones.
    await expect(
      within(header)
        .getAllByText(/^\d+ documents?( · |$)/)
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(1);
    await expect(
      within(northline).getAllByRole("button", { name: /^More actions for/ })
        .length,
    ).toBeGreaterThan(0);
  },
};

/**
 * A long company name and title truncate instead of widening the card: the
 * page must never scroll sideways on a phone.
 */
export const PhoneLongNames: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: {
    groups: companyStoryGroups.map((group, index) =>
      index === 0
        ? {
            ...group,
            name: "Chief Executive Officer (CEO) International Holdings Limited Mauritius",
            entries: group.entries.map((entry, entryIndex) =>
              entryIndex === 0
                ? {
                    ...entry,
                    title:
                      "Copy of Change Request for the new office fit-out and renovation works",
                  }
                : entry,
            ),
          }
        : group,
    ),
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      ".company-document-groups",
    ) as HTMLElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
    for (const card of root.querySelectorAll(".company-document-group")) {
      await expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(
        root.getBoundingClientRect().right + 1,
      );
    }
  },
};

/** Long groups show the first few documents and "Show N more". */
export const ShowMore: Story = {
  args: { previewCount: 2 },
  play: async ({ canvasElement }) => {
    const northline = within(
      within(canvasElement).getByRole("region", { name: "Northline Studio" }),
    );
    await expect(northline.getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(
      northline.getByRole("button", { name: "Show 3 more" }),
    );
    await expect(northline.getAllByRole("listitem")).toHaveLength(5);
    await expect(
      northline.getByRole("button", { name: "Show less" }),
    ).toBeVisible();
  },
};

/** Search or filters left nothing. */
export const NoMatches: Story = {
  args: { groups: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("No documents match"),
    ).toBeVisible();
  },
};

/** Loading: header-and-rows shimmer plus one status message. */
export const Loading: Story = {
  render: () => <CompanyDocumentGroupsSkeleton />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: /loading your documents/i,
      }),
    ).toBeInTheDocument();
  },
};

/** Phones: the skeleton mirrors the phone header (no avatar) and slim rows. */
export const LoadingPhone: Story = {
  ...Loading,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
