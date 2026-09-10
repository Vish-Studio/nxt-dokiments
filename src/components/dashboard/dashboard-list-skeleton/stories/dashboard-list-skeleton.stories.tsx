import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  clientListColumns,
  clientSkeletonRow,
} from "@/components/dashboard/client-list/client-list";
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
    columns: clientListColumns,
    message: "Loading your clients…",
    row: clientSkeletonRow,
  },
} satisfies Meta<typeof DashboardListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clients: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The one thing assistive tech should get — the shimmer itself is aria-hidden.
    await expect(
      canvas.getByRole("status", { name: /loading your clients/i }),
    ).toBeInTheDocument();

    await expect(
      canvasElement.querySelectorAll(".skeleton").length,
    ).toBeGreaterThan(0);

    // Same column header as the loaded list, so the layout doesn't shift on arrival.
    await expect(canvas.getByText("Company")).toBeInTheDocument();
  },
};

/** The documents list, proving the same skeleton serves both column sets. */
export const Documents: Story = {
  args: {
    columns: documentListColumns,
    message: "Loading your documents…",
    ordered: true,
    row: documentSkeletonRow,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your documents/i }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Date created")).toBeInTheDocument();

    // `ordered` must match the loaded list, which renders an <ol>.
    await expect(canvasElement.querySelector("ol")).toBeInTheDocument();
  },
};

export const SingleRow: Story = {
  args: { count: 1 },
};

/** Narrow viewport: company and contact columns collapse, leaving the mobile sub-line. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
