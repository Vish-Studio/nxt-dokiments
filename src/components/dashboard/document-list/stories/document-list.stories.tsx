import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { DocumentList } from "../document-list";

const documents = [
  {
    createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
    id: "doc-story-1",
    name: "June Retainer Invoice",
    templateId: "classic-invoice",
    updatedAt: new Date("2026-06-18T09:30:00Z").getTime(),
    values: { title: "Lumina Events Invoice" },
  },
  {
    createdAt: new Date("2026-06-14T13:15:00Z").getTime(),
    id: "doc-story-2",
    name: "Website Redesign Proposal",
    templateId: "modern-proposal",
    updatedAt: new Date("2026-06-14T13:15:00Z").getTime(),
    values: { title: "Northstar Website Proposal" },
  },
  {
    createdAt: new Date("2026-06-08T08:00:00Z").getTime(),
    id: "doc-story-3",
    name: "Studio Services Agreement",
    templateId: "classic-contract",
    updatedAt: new Date("2026-06-08T08:00:00Z").getTime(),
    values: { title: "Lumina Events Agreement" },
  },
];

const meta = {
  title: "Dashboard/Document List",
  component: DocumentList,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-5 sm:p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    documents,
    onEdit: fn(),
    onPreview: fn(),
    onPrint: fn(),
  },
} satisfies Meta<typeof DocumentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
