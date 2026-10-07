import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  documentListColumns,
  documentSkeletonRow,
} from "@/components/dashboard/document-list/document-list";

import { DashboardListSkeleton } from "../dashboard-list-skeleton";

const meta = {
  title: "Dashboard/Dashboard List Skeleton",
  component: DashboardListSkeleton,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    columns: documentListColumns,
    message: "Loading your documents…",
    ordered: true,
    row: documentSkeletonRow,
  },
} satisfies Meta<typeof DashboardListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The one thing assistive tech should get — the shimmer itself is aria-hidden.
    await expect(
      canvas.getByRole("status", { name: /loading your documents/i }),
    ).toBeInTheDocument();

    await expect(
      canvasElement.querySelectorAll(".skeleton").length,
    ).toBeGreaterThan(0);

    // Same column header as the loaded list, so the layout doesn't shift on arrival.
    await expect(canvas.getByText("Date created")).toBeInTheDocument();
  },
};

/** A single row keeps the generic list primitive easy to inspect in isolation. */
export const SingleRow: Story = {
  args: { count: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your documents/i }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Date created")).toBeInTheDocument();

    // `ordered` must match the loaded document list, which renders an <ol>.
    await expect(canvasElement.querySelector("ol")).toBeInTheDocument();
  },
};

/** Narrow viewport: the document list collapses down to its essential row content. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
