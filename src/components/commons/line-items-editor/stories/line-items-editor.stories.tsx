import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { readLineItems } from "@/lib/market-place/line-items";
import { LineItemsEditor } from "../line-items-editor";
const meta = { title: "Commons/Line Items Editor", component: LineItemsEditor, args: { value: "Existing work — $250", onChange: fn() } } satisfies Meta<typeof LineItemsEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LegacyPreserved: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Add item" }));
    const encoded = args.onChange.mock.calls[0][0];
    await expect(readLineItems(encoded)).toEqual([{ description: "Existing work — $250", quantity: "", price: "" }, { description: "", quantity: "1", price: "" }]);
  },
};
