import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";

import { ResponsiveHeaderControls } from "../responsive-header-controls";

const meta = {
  title: "Dashboard/Responsive Header Controls",
  component: ResponsiveHeaderControls,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-app-panel p-6">
        <div id="page-header-controls" />
        <Story />
      </div>
    ),
  ],
  args: {
    desktopContent: <span>Desktop controls</span>,
    desktopHeader: <span>Header search</span>,
    children: (
      <CollectionToolbar
        ariaLabel="Template controls"
        onReset={() => undefined}
        onSearch={() => undefined}
        onSort={() => undefined}
        search=""
        searchLabel="Search templates"
        sort="recent"
        sortOptions={[{ label: "Recently added", value: "recent" }]}
      />
    ),
  },
} satisfies Meta<typeof ResponsiveHeaderControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
